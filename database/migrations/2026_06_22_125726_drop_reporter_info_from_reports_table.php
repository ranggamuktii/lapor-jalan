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
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['reporter_name', 'reporter_phone']);
            $table->string('resolved_photo_path')->nullable()->after('photo_path');
            $table->unsignedInteger('upvotes_count')->default(0)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->string('reporter_name')->after('user_id')->nullable();
            $table->string('reporter_phone')->after('reporter_name')->nullable();
            $table->dropColumn(['resolved_photo_path', 'upvotes_count']);
        });
    }
};
