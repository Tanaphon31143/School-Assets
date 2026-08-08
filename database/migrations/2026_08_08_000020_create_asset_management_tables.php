<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('equipment_categories', function (Blueprint $table) {
            $table->id(); $table->string('name'); $table->string('code')->unique(); $table->text('description')->nullable(); $table->timestamps();
        });
        Schema::create('equipment_locations', function (Blueprint $table) {
            $table->id(); $table->string('name'); $table->string('building')->nullable(); $table->string('floor')->nullable(); $table->text('description')->nullable(); $table->timestamps();
        });
        Schema::create('equipment', function (Blueprint $table) {
            $table->id(); $table->string('code')->unique(); $table->string('name');
            $table->foreignId('equipment_category_id')->constrained()->restrictOnDelete();
            $table->foreignId('equipment_location_id')->nullable()->constrained()->nullOnDelete();
            $table->string('brand')->nullable(); $table->string('model')->nullable(); $table->string('serial_number')->nullable()->index();
            $table->date('purchase_date')->nullable(); $table->decimal('purchase_price', 12, 2)->nullable(); $table->unsignedInteger('quantity')->default(1); $table->string('unit')->default('ชิ้น');
            $table->enum('status', ['available','borrowed','maintenance','damaged','disposed'])->default('available')->index();
            $table->enum('condition', ['new','good','fair','poor'])->default('good'); $table->string('image')->nullable(); $table->string('qr_code')->nullable(); $table->date('warranty_expire_date')->nullable(); $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamps();
        });
        Schema::create('equipment_borrowings', function (Blueprint $table) {
            $table->id(); $table->foreignId('equipment_id')->constrained()->restrictOnDelete(); $table->foreignId('user_id')->constrained()->restrictOnDelete(); $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete(); $table->unsignedInteger('quantity')->default(1); $table->date('borrow_date'); $table->date('expected_return_date'); $table->date('actual_return_date')->nullable(); $table->text('purpose')->nullable(); $table->enum('status', ['pending','approved','rejected','borrowed','returned','overdue'])->default('pending')->index(); $table->text('approval_notes')->nullable(); $table->string('return_condition')->nullable(); $table->timestamps();
        });
        Schema::create('equipment_maintenances', function (Blueprint $table) {
            $table->id(); $table->foreignId('equipment_id')->constrained()->restrictOnDelete(); $table->foreignId('reported_by')->constrained('users')->restrictOnDelete(); $table->date('reported_date'); $table->text('issue_description'); $table->enum('status', ['reported','in_progress','completed','cannot_repair'])->default('reported')->index(); $table->decimal('repair_cost', 12, 2)->nullable(); $table->date('repaired_date')->nullable(); $table->text('notes')->nullable(); $table->timestamps();
        });
        Schema::create('equipment_disposals', function (Blueprint $table) {
            $table->id(); $table->foreignId('equipment_id')->constrained()->restrictOnDelete(); $table->date('disposal_date'); $table->text('reason'); $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete(); $table->enum('disposal_method', ['sold','destroyed','donated']); $table->text('notes')->nullable(); $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_disposals'); Schema::dropIfExists('equipment_maintenances'); Schema::dropIfExists('equipment_borrowings'); Schema::dropIfExists('equipment'); Schema::dropIfExists('equipment_locations'); Schema::dropIfExists('equipment_categories');
    }
};
