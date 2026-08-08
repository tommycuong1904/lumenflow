#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

const PAYMENT_COUNTER: Symbol = symbol_short!("COUNTER");

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Payment(u64),
}

#[derive(Clone)]
#[contracttype]
pub enum PaymentStatus {
    Pending,
    Completed,
    Cancelled,
}

#[derive(Clone)]
#[contracttype]
pub struct PaymentIntent {
    pub id: u64,
    pub creator: Address,
    pub recipient: Address,
    pub amount: i128,
    pub status: PaymentStatus,
}

#[contract]
pub struct PaymentIntentContract;

#[contractimpl]
impl PaymentIntentContract {
    pub fn create_payment(env: Env, creator: Address, recipient: Address, amount: i128) -> u64 {
        creator.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let next_id = env
            .storage()
            .persistent()
            .get::<_, u64>(&PAYMENT_COUNTER)
            .unwrap_or(0)
            + 1;

        let payment = PaymentIntent {
            id: next_id,
            creator,
            recipient,
            amount,
            status: PaymentStatus::Pending,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Payment(next_id), &payment);
        env.storage().persistent().set(&PAYMENT_COUNTER, &next_id);

        next_id
    }

    pub fn complete_payment(env: Env, id: u64, creator: Address) {
        creator.require_auth();

        let mut payment = Self::get_payment(env.clone(), id);
        if payment.creator != creator {
            panic!("creator mismatch");
        }

        payment.status = PaymentStatus::Completed;
        env.storage()
            .persistent()
            .set(&DataKey::Payment(id), &payment);
    }

    pub fn cancel_payment(env: Env, id: u64, creator: Address) {
        creator.require_auth();

        let mut payment = Self::get_payment(env.clone(), id);
        if payment.creator != creator {
            panic!("creator mismatch");
        }

        payment.status = PaymentStatus::Cancelled;
        env.storage()
            .persistent()
            .set(&DataKey::Payment(id), &payment);
    }

    pub fn get_payment(env: Env, id: u64) -> PaymentIntent {
        env.storage()
            .persistent()
            .get(&DataKey::Payment(id))
            .unwrap_or_else(|| panic!("payment not found"))
    }
}
