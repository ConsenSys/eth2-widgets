////////////////////////////////////////////////////////////////////////////////
//
// Specs constants and simulation variables
//
////////////////////////////////////////////////////////////////////////////////

pub const MAX_EFFECTIVE_BALANCE: u64 = 32_000_000_000;
pub const BASE_REWARD_FACTOR: u64 = 64;
pub const BASE_REWARDS_PER_EPOCH: u64 = 4;
pub const PROPOSER_REWARD_QUOTIENT: u64 = 8;
pub const EFFECTIVE_BALANCE_INCREMENT: u64 = 1_000_000_000;

pub struct Config {
    // how many epochs we want to run?
    pub epochs: i32,

    // how much ETH we want to start with?
    pub total_at_stake_initial: u64,

    // probabilities of any validator
    pub probability_online: f32,
    pub probability_honest: f32,

    // pre-computation
    pub exp_value_inclusion_prob: f32,
}

impl Config {
    pub fn new(_total_at_stake_initial: u32, _probability_online: f32, _probability_honest: f32) -> Config {
        let total_at_stake_initial = _total_at_stake_initial as u64 * 1_000_000 * 1_000_000_000;
        let epochs = 9000; // (60 * 60 * 24 * 365)/(12 * 32) -> 1 year
        let probability_online: f32 = _probability_online / 100f32;
        let probability_honest: f32 = _probability_honest / 100f32;

        // pre-computation
        let exp_value_inclusion_prob = Config::get_exp_value_inclusion_prob(probability_online);

        Config {
            epochs: epochs,
            total_at_stake_initial: total_at_stake_initial,
            probability_online: probability_online,
            probability_honest: probability_honest,
            exp_value_inclusion_prob: exp_value_inclusion_prob,
        }
    }

    fn get_exp_value_inclusion_prob(p: f32) -> f32 {
        p * p.ln() / (p - 1.00)
    }
}
