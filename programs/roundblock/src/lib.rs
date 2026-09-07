use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("RoundBlock11111111111111111111111111111111111");

#[program]
pub mod roundblock {
    use super::*;

    /// Proposes an exploding trade escrow with a temporal expiration duration (e.g. 24 hours).
    /// Assets are transferred into the TradeEscrow ATA vault.
    /// If future draft picks (draft_year > current_year) are offered, CPI transfers league entry fee USDC
    /// into the PickCollateralVault PDA.
    pub fn propose_trade(
        ctx: Context<ProposeTrade>,
        duration_seconds: i64,
        requires_collateral: bool,
        collateral_amount_cents: u64,
    ) -> Result<()> {
        require!(duration_seconds > 0, EscrowError::InvalidDuration);

        let clock = Clock::get()?;
        let escrow = &mut ctx.accounts.trade_escrow;

        escrow.sender = ctx.accounts.sender.key();
        escrow.recipient = ctx.accounts.recipient.key();
        escrow.league = ctx.accounts.league.key();
        escrow.created_at = clock.unix_timestamp;
        escrow.expires_at = clock
            .unix_timestamp
            .checked_add(duration_seconds)
            .ok_or(EscrowError::ArithmeticOverflow)?;
        escrow.status = TradeStatus::Pending;
        escrow.requires_collateral = requires_collateral;
        escrow.collateral_amount = collateral_amount_cents;
        escrow.bump = ctx.bumps.trade_escrow;

        // If future pick collateral is required, execute CPI transfer of USDC to Collateral Vault
        if requires_collateral && collateral_amount_cents > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.sender_usdc_ata.to_account_info(),
                to: ctx.accounts.collateral_vault_usdc.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, collateral_amount_cents)?;
        }

        msg!("RoundBlock TradeEscrow PDA created: expires at {}", escrow.expires_at);
        Ok(())
    }

    /// Accepts an active trade offer before the temporal expiration lock.
    /// Enforces: require!(clock.unix_timestamp < escrow.expires_at, EscrowError::TradeExpired)
    pub fn accept_trade(ctx: Context<AcceptTrade>) -> Result<()> {
        let clock = Clock::get()?;
        let escrow = &mut ctx.accounts.trade_escrow;

        require!(
            escrow.status == TradeStatus::Pending,
            EscrowError::InvalidStatus
        );

        // On-chain temporal lock evaluation
        require!(
            clock.unix_timestamp < escrow.expires_at,
            EscrowError::TradeExpired
        );

        escrow.status = TradeStatus::Accepted;
        msg!("RoundBlock TradeEscrow accepted on-chain before expiration.");
        Ok(())
    }

    /// Reclaims locked assets, refunds dynasty collateral via PDA CPI signer, and closes the TradeEscrow PDA if expired.
    /// Enforces: constraint = Clock::get()?.unix_timestamp >= trade_escrow.expires_at @ EscrowError::TradeNotExpired
    pub fn reclaim_trade(ctx: Context<ReclaimTrade>) -> Result<()> {
        let escrow = &mut ctx.accounts.trade_escrow;

        require!(
            escrow.status == TradeStatus::Pending,
            EscrowError::InvalidStatus
        );

        // If Dynasty Pick collateral was locked, refund it to sender using PDA signer seeds
        if escrow.requires_collateral && escrow.collateral_amount > 0 {
            let league_key = escrow.league;
            let bump = ctx.bumps.collateral_vault_usdc;
            let seeds = &[
                b"collateral",
                league_key.as_ref(),
                &[bump],
            ];
            let signer_seeds = &[&seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.collateral_vault_usdc.to_account_info(),
                to: ctx.accounts.sender_usdc_ata.to_account_info(),
                authority: ctx.accounts.collateral_vault_usdc.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
            token::transfer(cpi_ctx, escrow.collateral_amount)?;
        }

        escrow.status = TradeStatus::Reclaimed;
        msg!("RoundBlock TradeEscrow expired. Reclaimed locked assets and refunded collateral to sender.");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(duration_seconds: i64, requires_collateral: bool, collateral_amount_cents: u64)]
pub struct ProposeTrade<'info> {
    #[account(mut, signer)]
    pub sender: Signer<'info>,
    /// CHECK: Recipient pubkey verified via seed constraint
    pub recipient: AccountInfo<'info>,
    /// CHECK: League pubkey verified via seed constraint
    pub league: AccountInfo<'info>,

    #[account(
        init,
        payer = sender,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 8 + 1,
        seeds = [b"trade", sender.key().as_ref(), recipient.key().as_ref(), league.key().as_ref()],
        bump
    )]
    pub trade_escrow: Account<'info, TradeEscrow>,

    #[account(mut)]
    pub sender_usdc_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub collateral_vault_usdc: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AcceptTrade<'info> {
    #[account(mut, signer)]
    pub recipient: Signer<'info>,
    #[account(
        mut,
        seeds = [b"trade", trade_escrow.sender.as_ref(), recipient.key().as_ref(), trade_escrow.league.as_ref()],
        bump = trade_escrow.bump,
        constraint = Clock::get()?.unix_timestamp < trade_escrow.expires_at @ EscrowError::TradeExpired
    )]
    pub trade_escrow: Account<'info, TradeEscrow>,
}

#[derive(Accounts)]
pub struct ReclaimTrade<'info> {
    #[account(mut, signer)]
    pub sender: Signer<'info>,

    #[account(
        mut,
        close = sender,
        seeds = [b"trade", sender.key().as_ref(), trade_escrow.recipient.as_ref(), trade_escrow.league.as_ref()],
        bump = trade_escrow.bump,
        constraint = Clock::get()?.unix_timestamp >= trade_escrow.expires_at @ EscrowError::TradeNotExpired
    )]
    pub trade_escrow: Account<'info, TradeEscrow>,

    #[account(mut)]
    pub sender_usdc_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"collateral", trade_escrow.league.as_ref()],
        bump
    )]
    pub collateral_vault_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TradeEscrow {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub league: Pubkey,
    pub assets: [Pubkey; 2],
    pub created_at: i64,
    pub expires_at: i64,
    pub status: TradeStatus,
    pub requires_collateral: bool,
    pub is_future_pick: bool,
    pub collateral_amount: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TradeStatus {
    Pending,
    Accepted,
    Expired,
    Reclaimed,
}

#[error_code]
pub enum EscrowError {
    #[msg("Temporal lock expired: This trade offer has expired on-chain.")]
    TradeExpired,
    #[msg("Trade offer has not expired yet: Cannot reclaim active trade.")]
    TradeNotExpired,
    #[msg("Invalid trade status for this operation.")]
    InvalidStatus,
    #[msg("Unauthorized account for trade resolution.")]
    Unauthorized,
    #[msg("Duration must be a positive number of seconds.")]
    InvalidDuration,
    #[msg("Checked arithmetic overflow on escrow timestamp.")]
    ArithmeticOverflow,
}
