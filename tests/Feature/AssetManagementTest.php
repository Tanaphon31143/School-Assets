<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Equipment;
use App\Models\EquipmentBorrowing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AssetManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_open_equipment_management(): void
    {
        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $this->actingAs($admin)->get('/admin/equipment')->assertOk();
    }

    public function test_student_cannot_open_admin_equipment_management(): void
    {
        $student = User::where('email', 'student@example.com')->firstOrFail();
        $this->actingAs($student)->get('/admin/equipment')->assertForbidden();
    }

    public function test_student_and_teacher_can_open_their_dashboards(): void
    {
        $student = User::where('email', 'student@example.com')->firstOrFail();
        $teacher = User::where('email', 'teacher@example.com')->firstOrFail();

        $this->actingAs($student)->get('/student/dashboard')->assertOk();
        $this->actingAs($teacher)->get('/teacher/dashboard')->assertOk();
    }

    public function test_teacher_cannot_open_admin_equipment_management(): void
    {
        $teacher = User::where('email', 'teacher@example.com')->firstOrFail();

        $this->actingAs($teacher)->get('/admin/equipment')->assertForbidden();
    }

    public function test_login_redirects_admin_to_admin_dashboard(): void
    {
        $this->post('/login', ['email'=>'admin@example.com','password'=>'password'])->assertRedirect('/admin/dashboard');
    }

    public function test_student_can_submit_borrowing_request_and_notify_admin(): void
    {
        $student = User::where('email', 'student@example.com')->firstOrFail();
        $equipment = Equipment::firstOrFail();
        $this->actingAs($student)->post('/borrowings', ['equipment_id'=>$equipment->id,'quantity'=>1,'expected_return_date'=>now()->addDays(3)->format('Y-m-d'),'purpose'=>'ทดสอบ'])->assertRedirect();
        $this->assertDatabaseHas('equipment_borrowings', ['user_id'=>$student->id,'equipment_id'=>$equipment->id,'status'=>'pending']);
        $this->assertDatabaseHas('notifications', ['notifiable_id'=>User::where('email','admin@example.com')->value('id')]);
    }

    public function test_admin_can_approve_and_student_can_return_borrowing(): void
    {
        $student = User::where('email', 'student@example.com')->firstOrFail();
        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $equipment = Equipment::firstOrFail();
        $this->actingAs($student)->post('/borrowings', ['equipment_id'=>$equipment->id,'quantity'=>1,'expected_return_date'=>now()->addDays(3)->format('Y-m-d')]);
        $borrowing = EquipmentBorrowing::latest('id')->firstOrFail();
        $this->actingAs($admin)->patch("/borrowings/{$borrowing->id}/approve")->assertRedirect();
        $this->assertDatabaseHas('equipment_borrowings', ['id'=>$borrowing->id,'status'=>'approved','approved_by'=>$admin->id]);
        $this->assertDatabaseHas('equipment', ['id'=>$equipment->id,'status'=>'borrowed']);
        $this->actingAs($student)->patch("/borrowings/{$borrowing->id}/return", ['return_condition'=>'good'])->assertRedirect();
        $this->assertDatabaseHas('equipment_borrowings', ['id'=>$borrowing->id,'status'=>'returned']);
        $this->assertDatabaseHas('equipment', ['id'=>$equipment->id,'status'=>'available']);
    }

    public function test_admin_can_dispose_equipment_and_view_reports(): void
    {
        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $equipment = Equipment::firstOrFail();
        $this->actingAs($admin)->post('/admin/disposals', ['equipment_id'=>$equipment->id,'disposal_date'=>now()->format('Y-m-d'),'reason'=>'หมดอายุการใช้งาน','disposal_method'=>'destroyed'])->assertRedirect();
        $this->assertDatabaseHas('equipment', ['id'=>$equipment->id,'status'=>'disposed']);
        $this->actingAs($admin)->get('/reports')->assertOk();
        $this->actingAs($admin)->get('/reports/borrowings')->assertOk();
        $this->actingAs($admin)->get('/reports/qr-print')->assertOk();
    }

    public function test_public_equipment_scan_is_available_without_login(): void
    {
        $equipment = Equipment::firstOrFail();
        $this->get("/scan/equipment/{$equipment->id}")->assertOk()->assertSee($equipment->code);
        $this->assertGuest();
        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $this->actingAs($admin)->get("/equipment/{$equipment->id}/qr")->assertOk()->assertSee('School Assets');
    }
}
