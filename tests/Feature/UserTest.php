<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class UserTest extends TestCase
{
    public function test_guest_cannot_access_users_page(): void
    {
        $response = $this->get('/users');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_users_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/users');

        $response->assertStatus(200);
    }

    public function test_users_page_returns_correct_inertia_component(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/users');

        $response->assertStatus(200);

        $response->assertInertia(
            fn($page) =>
            $page->component('User/Index')
        );
    }

    public function test_users_page_contains_users_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/users');

        $response->assertInertia(
            fn($page) =>
            $page->has('users')
        );
    }

    public function test_users_are_paginated(): void
    {
        $loggedInUser = User::factory()->create();

        User::factory()->count(11)->create();

        $response = $this->actingAs($loggedInUser)->get('/users');

        $response->assertInertia(
            fn($page) =>
            $page->has('users.data', 10)
                ->where('users.per_page', 10)
                ->where('users.current_page', 1)
        );
    }

    public function test_users_can_be_searched(): void
    {
        $loggedInUser = User::factory()->create();

        $john = User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        User::factory()->create([
            'first_name' => 'Ahmed',
            'last_name' => 'Khan',
        ]);

        $response = $this->actingAs($loggedInUser)
            ->get('/users?search=John');

        $response->assertInertia(
            fn($page) =>
            $page->where('users.data.0.id', $john->id)
        );
    }

    public function test_users_can_be_searched_by_last_name(): void
    {
        $loggedInUser = User::factory()->create();

        $user = User::factory()->create([
            'first_name' => 'Ahmed',
            'last_name' => 'Khan',
        ]);

        User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Smith',
        ]);

        $response = $this->actingAs($loggedInUser)
            ->get('/users?search=Khan');

        $response->assertInertia(
            fn($page) =>
            $page->where(
                'users.data',
                fn($users) =>
                collect($users)->contains('id', $user->id)
            )
        );
    }
}
