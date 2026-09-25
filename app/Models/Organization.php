<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\MailboxLicenseBundle;

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
        // Wrap everything in a database transaction for safety
        return DB::transaction(function () use ($amount, $currency, $paymentMethod, $appUuid, $referenceId) {

            $balanceBefore = $this->balance;

            // Safely increment the balance to prevent race conditions
            $this->increment('balance', $amount);

            // Refresh to get the true updated balance from the database
            $this->refresh();
            $balanceAfter = $this->balance;

            // Create the transaction log
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
        });
    }
    public function licenseBundles()
    {
        return $this->hasMany(MailboxLicenseBundle::class, 'organization_id');
    }
}
