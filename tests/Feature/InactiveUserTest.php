<?php
namespace Tests\Feature;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class InactiveUserTest extends TestCase { use RefreshDatabase; public function test_inactive_user_cannot_login():void { $this->seed(); User::where('email','student@example.com')->update(['status'=>'inactive']); $this->post('/login',['email'=>'student@example.com','password'=>'password'])->assertSessionHasErrors('email'); $this->assertGuest(); } }
