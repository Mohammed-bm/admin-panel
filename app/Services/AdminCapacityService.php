<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\OrganizationCapacity;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AdminCapacityService
{
    public function updateCapacity(
        Organization $organization,
        array $newCapacities
    ): OrganizationCapacity {
        return DB::transaction(function () use ($organization, $newCapacities) {

            // Find the organization's active capacity record
            $organizationCapacity = OrganizationCapacity::where(
                'organization_id',
                $organization->id
            )
                ->where('is_active', true)
                ->first();

            if (!$organizationCapacity) {
                throw new InvalidArgumentException(
                    'No active capacity record found for this organization.'
                );
            }

            // Get current usage
            $usage = $organizationCapacity->usage ?? [];

            // Check every submitted capacity against current usage
            foreach ($newCapacities as $feature => $newLimit) {

                // -1 means unlimited
                if ($newLimit === -1) {
                    continue;
                }

                // Make sure the value is a valid number
                if (!is_int($newLimit) && !is_float($newLimit)) {
                    throw new InvalidArgumentException(
                        "Invalid capacity value for {$feature}."
                    );
                }

                // Capacity cannot be below current usage
                $currentUsage = $usage[$feature] ?? 0;

                if ($newLimit < $currentUsage) {
                    throw new InvalidArgumentException(
                        "{$feature} cannot be reduced below current usage of {$currentUsage}."
                    );
                }
            }

            // Update ONLY the capacities JSON
            $organizationCapacity->capacities = $newCapacities;
            $organizationCapacity->save();

            return $organizationCapacity->fresh();
        });
    }
}