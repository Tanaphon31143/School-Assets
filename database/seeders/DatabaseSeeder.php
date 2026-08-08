<?php

namespace Database\Seeders;

use App\Models\EquipmentCategory;
use App\Models\EquipmentLocation;
use App\Models\User;
use App\Models\Equipment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = collect(['manage users','manage equipment','manage categories','manage locations','approve borrowings','manage maintenance','manage disposals','view reports','export reports','borrow equipment','return equipment','report damage'])->map(fn ($name) => Permission::firstOrCreate(['name'=>$name,'guard_name'=>'web']));
        $admin = Role::firstOrCreate(['name'=>'admin','guard_name'=>'web']); $teacher = Role::firstOrCreate(['name'=>'teacher','guard_name'=>'web']); $student = Role::firstOrCreate(['name'=>'student','guard_name'=>'web']);
        $admin->syncPermissions($permissions); $teacher->syncPermissions($permissions->whereIn('name',['borrow equipment','return equipment','report damage','view reports'])); $student->syncPermissions($permissions->whereIn('name',['borrow equipment','return equipment','report damage']));
        foreach ([['ผู้ดูแลระบบ','admin@example.com',$admin],['ครูตัวอย่าง','teacher@example.com',$teacher],['นักเรียนตัวอย่าง','student@example.com',$student]] as [$name,$email,$role]) { $user=User::firstOrCreate(['email'=>$email],['name'=>$name,'password'=>Hash::make('password'),'status'=>'active']); $user->syncRoles([$role]); }
        foreach ([['คอมพิวเตอร์','IT'],['อุปกรณ์กีฬา','SPORT'],['เฟอร์นิเจอร์','FURN'],['อุปกรณ์วิทยาศาสตร์','SCI'],['สื่อการสอน','EDU']] as [$name,$code]) EquipmentCategory::firstOrCreate(['code'=>$code],['name'=>$name]);
        foreach ([['ห้องพัสดุ','อาคาร 1','1'],['ห้อง Lab คอมพิวเตอร์','อาคาร 2','2'],['ห้องสมุด','อาคาร 3','1']] as [$name,$building,$floor]) EquipmentLocation::firstOrCreate(['name'=>$name],['building'=>$building,'floor'=>$floor]);
        $categoryIds=EquipmentCategory::pluck('id','code'); $locationIds=EquipmentLocation::pluck('id','name');
        $samples=[['คอมพิวเตอร์ตั้งโต๊ะ','IT','ห้อง Lab คอมพิวเตอร์'],['โน้ตบุ๊ก','IT','ห้องพัสดุ'],['เครื่องพิมพ์','IT','ห้องพัสดุ'],['ลูกฟุตบอล','SPORT','ห้องพัสดุ'],['โต๊ะเรียน','FURN','ห้องเรียน 1'],['เก้าอี้นักเรียน','FURN','ห้องเรียน 1'],['กล้องจุลทรรศน์','SCI','ห้อง Lab คอมพิวเตอร์'],['ชุดทดลองไฟฟ้า','SCI','ห้อง Lab คอมพิวเตอร์'],['โปรเจกเตอร์','EDU','ห้องพัสดุ'],['กระดานไวท์บอร์ด','EDU','ห้องเรียน 1']];
        foreach (range(1,20) as $i) { [$name,$code,$location]=$samples[($i-1)%count($samples)]; Equipment::firstOrCreate(['code'=>sprintf('EQ-%04d',$i)],['name'=>$name,'equipment_category_id'=>$categoryIds[$code],'equipment_location_id'=>$locationIds[$location]??$locationIds->first(),'quantity'=>1,'unit'=>'ชิ้น','status'=>'available','condition'=>$i%3===0?'new':'good','purchase_price'=>1000+$i*250,'purchase_date'=>now()->subMonths($i)]); }
    }
}
