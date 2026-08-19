#!/usr/bin/env python3
"""
RoundBlock Protocol — Dynasty Pick Collateral Vault & Temporal Escrow Simulator
Simulates Solana Anchor program instructions, CPI branching logic, and Clock::get() temporal locks.
"""

import time
import sys

# ANSI Color Codes matching RoundBlock High-Contrast Terminal Palette
RESET = "\033[0m"
BOLD = "\033[1m"
GREEN = "\033[38;2;90;247;142m"   # Neon Green (#5af78e)
ORANGE = "\033[38;2;255;158;100m" # Neon Orange (#ff9e64)
CYAN = "\033[38;2;6;182;212m"     # Neon Cyan (#06b6d4)
SLATE = "\033[38;2;148;163;184m"  # Slate-400
BG_DARK = "\033[48;2;9;9;11m"     # Slate-950 backdrop

class TradeEscrowState:
    def __init__(self, pda, sender, recipient, offered_assets, requested_assets, expires_at, collateral_cents):
        self.pda = pda
        self.sender = sender
        self.recipient = recipient
        self.offered_assets = offered_assets
        self.requested_assets = requested_assets
        self.created_at = int(time.time())
        self.expires_at = expires_at
        self.status = "PENDING"
        self.collateral_cents = collateral_cents
        self.requires_collateral = any(a.get("is_future_pick") for a in offered_assets)

class DynastyVaultSimulator:
    def __init__(self):
        self.clock_offset_seconds = 0
        self.manager_a_usdc = 250_00  # $250.00 USDC in cents
        self.manager_a_prepaid_dues = False
        self.manager_b_usdc = 150_00
        self.collateral_vault_pda_balance = 0
        self.active_escrow = None

    def get_solana_clock(self):
        return int(time.time()) + self.clock_offset_seconds

    def render_header(self):
        print(f"\n{BG_DARK}{BOLD}{CYAN}=========================================================================={RESET}")
        print(f"{BG_DARK}{BOLD}{GREEN} 🏈 ROUNDBLOCK PROTOCOL — SOLANA ANCHOR CPI & TEMPORAL ESCROW SIMULATOR {RESET}")
        print(f"{BG_DARK}{SLATE} On-Chain Clock::get() Locks & Dynasty Pick Collateral Vault Branching {RESET}")
        print(f"{BG_DARK}{CYAN}=========================================================================={RESET}\n")

    def print_status(self):
        clock = self.get_solana_clock()
        time_str = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(clock))
        print(f"{BOLD}{CYAN}[SOLANA SYSTEM CLOCK]{RESET} {time_str} UTC (Unix: {clock}) | Time Offset: +{self.clock_offset_seconds}s")
        print(f"{SLATE}Manager A USDC Wallet:{RESET} ${self.manager_a_usdc/100:.2f} USDC | {SLATE}Pre-paid 2027 Dues:{RESET} {GREEN if self.manager_a_prepaid_dues else ORANGE}{self.manager_a_prepaid_dues}{RESET}")
        print(f"{SLATE}PickCollateralVault PDA Balance:{RESET} {GREEN}${self.collateral_vault_pda_balance/100:.2f} USDC{RESET}")
        print("-" * 75)

    def propose_trade(self):
        print(f"\n{BOLD}{CYAN}--- PROPOSING DYNASTY TRADE (propose_trade Instruction) ---{RESET}")
        print("Manager A is offering: [2027 1st Round Draft Pick (Future Asset), 5-Star QB Card NFT]")
        print("Manager A requests: [5-Star WR Card NFT]")
        
        duration_choice = input("Select Temporal Lock Duration: (1) 12h, (2) 24h [Default], (3) 48h: ").strip()
        duration_map = {"1": 43200, "2": 86400, "3": 172800}
        duration = duration_map.get(duration_choice, 86400)
        
        clock = self.get_solana_clock()
        expires_at = clock + duration

        pda_address = f"TrdEsc{hex(clock)[2:]}9999999999"
        offered = [
            {"name": "2027 1st Round Draft Pick", "is_future_pick": True, "year": 2027},
            {"name": "Elijah Woods (5-Star QB NFT)", "is_future_pick": False}
        ]
        requested = [
            {"name": "Marcus Johnson (4-Star WR NFT)", "is_future_pick": False}
        ]

        self.active_escrow = TradeEscrowState(
            pda=pda_address,
            sender="Manager_A_Pubkey",
            recipient="Manager_B_Pubkey",
            offered_assets=offered,
            requested_assets=requested,
            expires_at=expires_at,
            collateral_cents=100_00 # $100.00 USDC
        )

        print(f"\n{GREEN}✅ TradeEscrow PDA Derived:{RESET} {pda_address}")
        print(f"{GREEN}⏰ Temporal Lock Expiration:{RESET} {time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(expires_at))} ({duration//3600} hours)")
        print(f"{ORANGE}⚠️ Dynasty Collateral Triggered:{RESET} 2027 Pick requires $100.00 USDC collateral verification.")

    def time_warp(self):
        print(f"\n{BOLD}{ORANGE}--- TIME WARP (Fast-Forwarding Solana Clock) ---{RESET}")
        hours = input("Enter hours to warp forward (e.g. 25 for 25 hours): ").strip()
        try:
            h = float(hours)
            self.clock_offset_seconds += int(h * 3600)
            print(f"{GREEN}⚡ Clock warped forward by {h} hours (+{int(h*3600)} seconds).{RESET}")
        except ValueError:
            print(f"{ORANGE}Invalid duration number.{RESET}")

    def accept_trade(self):
        print(f"\n{BOLD}{CYAN}--- ACCEPTING TRADE (accept_trade Instruction & CPI Branching) ---{RESET}")
        if not self.active_escrow:
            print(f"{ORANGE}No active trade proposal found. Propose a trade first!{RESET}")
            return

        escrow = self.active_escrow
        clock = self.get_solana_clock()

        print(f"Executing accept_trade on-chain for PDA {escrow.pda}...")
        print(f"Evaluating: Clock::get()?.unix_timestamp ({clock}) < escrow.expires_at ({escrow.expires_at})...")

        # Temporal Lock Check
        if clock >= escrow.expires_at:
            print(f"\n{BOLD}{ORANGE}🛑 TRANSACTION REJECTED [EscrowError::TradeExpired]{RESET}")
            print(f"{ORANGE}Temporal lock failed! Current time ({clock}) >= Expiration ({escrow.expires_at}).{RESET}")
            print("Sender can now call reclaim_trade to close PDA and recover assets.")
            escrow.status = "EXPIRED"
            return

        print(f"{GREEN}✅ Temporal lock valid! Trade is active.{RESET}")

        # Dynasty Collateral Branching Logic
        if escrow.requires_collateral:
            print("\n" + "="*50)
            print(f"{BOLD}{CYAN}[ON-CHAIN CPI BRANCHING ROUTER]{RESET}")
            print("Is future draft pick offered? -> YES (2027 Round 1 Pick)")

            if self.manager_a_prepaid_dues:
                print(f"{GREEN}Has Sender pre-paid 2027 dues? -> YES (Collateral Verified){RESET}")
                print(f"{GREEN}Proceeding directly with standard Token CPI swaps.{RESET}")
            else:
                print(f"{ORANGE}Has Sender pre-paid 2027 dues? -> NO{RESET}")
                print("Checking Manager A USDC wallet balance...")
                if self.manager_a_usdc >= escrow.collateral_cents:
                    print(f"{GREEN}Does Sender have $100.00 USDC in wallet? -> YES (${self.manager_a_usdc/100:.2f} available){RESET}")
                    print(f"\n{BOLD}{GREEN}Executing CPI Transfer:{RESET} spl_token::transfer($100.00 USDC) -> PickCollateralVault PDA")
                    
                    # Execute CPI simulation
                    self.manager_a_usdc -= escrow.collateral_cents
                    self.collateral_vault_pda_balance += escrow.collateral_cents
                    print(f"{GREEN}🔒 Lock Secured ✅ ($100.00 USDC transferred to Collateral Vault){RESET}")
                else:
                    print(f"{BOLD}{ORANGE}Does Sender have $100.00 USDC in wallet? -> NO (${self.manager_a_usdc/100:.2f} available){RESET}")
                    print(f"\n{BOLD}{ORANGE}🛑 TRANSACTION REJECTED ❌ [Insufficient Collateral Liquidity]{RESET}")
                    print(f"{ORANGE}Atomic transaction rolled back. Zero assets transferred.{RESET}")
                    return

        escrow.status = "ACCEPTED"
        print(f"\n{BOLD}{GREEN}🎉 TRADE COMPLETED SUCCESSFULLY! Roster swap finalized on-chain.{RESET}")

    def prepay_dues(self):
        print(f"\n{BOLD}{GREEN}--- PRE-PAYING DYNASTY DUES ---{RESET}")
        self.manager_a_prepaid_dues = True
        print(f"{GREEN}Manager A has pre-paid 2027 league dues directly into institutional treasury.{RESET}")

    def run(self):
        while True:
            self.render_header()
            self.print_status()

            if self.active_escrow:
                clock = self.get_solana_clock()
                diff = self.active_escrow.expires_at - clock
                status_color = GREEN if diff > 0 and self.active_escrow.status == "PENDING" else ORANGE
                print(f"{BOLD}Active Escrow PDA:{RESET} {self.active_escrow.pda}")
                print(f"{BOLD}Status:{RESET} {status_color}{self.active_escrow.status}{RESET} | {BOLD}Expires In:{RESET} {status_color}{diff}s ({diff/3600:.1f}h){RESET}\n")

            print("Select an action:")
            print("  (1) Propose Dynasty Trade (2027 Pick + 5-Star QB NFT)")
            print("  (2) Time Warp (Fast-Forward Solana System Clock)")
            print("  (3) Accept Trade & Route CPI (Execute On-Chain Branching)")
            print("  (4) Pre-pay 2027 League Dues")
            print("  (5) Reset Simulator")
            print("  (Q) Quit")

            choice = input("\nEnter choice (1-5 or Q): ").strip().upper()
            if choice == '1':
                self.propose_trade()
            elif choice == '2':
                self.time_warp()
            elif choice == '3':
                self.accept_trade()
            elif choice == '4':
                self.prepay_dues()
            elif choice == '5':
                self.__init__()
                print(f"\n{GREEN}Simulator reset to default initial state.{RESET}")
            elif choice == 'Q':
                print(f"\n{CYAN}Exiting RoundBlock Protocol Simulator. Goodbye!{RESET}\n")
                sys.exit(0)
            else:
                print(f"{ORANGE}Invalid option.{RESET}")

            input("\nPress Enter to continue...")

if __name__ == "__main__":
    sim = DynastyVaultSimulator()
    sim.run()
