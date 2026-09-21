# RoundBlock — extracted from the Gridiron Gateway compliance product

This branch preserves the Anchor exploding-trade program (`programs/roundblock`) and the IDL (`src/idl/roundblock.json`) after they were removed from the NCAA/NIL product line.

RoundBlock does not share tables or routes with RallySafe. It is dynasty-league escrow, not CSC NIL Go. Do not merge this branch back into `main` unless RoundBlock is being restored as a separate product surface with a real Solana client (the previous SPA was a `setTimeout` simulation that claimed transactions were signed on-chain).
