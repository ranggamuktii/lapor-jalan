<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('report_upvotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->cascadeOnDelete();
            $table->string('ip_address')->nullable();
            $table->string('device_id')->nullable();
            $table->timestamps();
            
            // Prevent exact duplicate upvotes from the same IP/Device if needed
            $table->unique(['report_id', 'ip_address', 'device_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_upvotes');
    }
};
