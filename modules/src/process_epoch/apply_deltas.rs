////////////////////////////////////////////////////////////////////////////////
//
// Simulates relevant `process_rewards_and_penalties` ops during the state transition
//
////////////////////////////////////////////////////////////////////////////////

use crate::types::*;

pub fn apply_deltas(old_validator: &Validator, deltas: &Deltas) -> Validator {
    Validator {
        balance: old_validator.balance + deltas.head_ffg_reward - deltas.head_ffg_penalty
            + deltas.proposer_reward
            + deltas.attester_reward,
        effective_balance: old_validator.effective_balance,
        is_active: old_validator.is_active,
        is_slashed: old_validator.is_slashed,
    }
}
