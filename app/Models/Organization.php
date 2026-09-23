<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Organization extends Model
{
    protected $table = 'organizations';

    protected $fillable = [
        'balance',
        'name',
        'website',
        'company_size',
        'plan',
        'user_id',
        'api_key',
    ];

    /**
     * Add credits to the organization and log the transaction.
     *
     * @param float|int $amount
     * @param string $currency
     * @param string|null $paymentMethod
     * @param string|null $appUuid
     * @param string|null $referenceId
     * @return void
     */
    public function addCredits(
        $amount,
        string $currency = 'USD',
        ?string $paymentMethod = null,
        ?string $appUuid = null,
        ?string $referenceId = null
    ) {
        $balanceBefore = $this->balance;
        $balanceAfter = $balanceBefore + $amount;

        $this->update([
            'balance' => $balanceAfter,
        ]);

        CreditTransaction::create([
            'id'                => (string) Str::uuid(),
            'organization_id'   => $this->id,
            'transaction_type'  => 'topup',
            'amount'            => $amount,
            'balance_before'    => $balanceBefore,
            'balance_after'     => $balanceAfter,
            'currency'          => $currency,
            'payment_method'    => $paymentMethod,
            'app_uuid'          => $appUuid,
            'reference_id'      => $referenceId,
        ]);
    }
}
