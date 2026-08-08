<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
class UserController extends Controller
{
    public function index(Request $request){$users=User::with('roles')->when($request->search,fn($q,$v)=>$q->where(fn($x)=>$x->where('name','like',"%$v%")->orWhere('email','like',"%$v%")))->when($request->role,fn($q,$v)=>$q->role($v))->latest()->paginate(15)->withQueryString();return view('admin.users.index',compact('users'));}
    public function create(){return view('admin.users.create',['roles'=>Role::orderBy('name')->get()]);}
    public function store(Request $request){$data=$this->validated($request);$data['password']=Hash::make($data['password']);$role=$data['role'];unset($data['role']);$user=User::create($data);$user->assignRole($role);return redirect()->route('admin.users.index')->with('success','เพิ่มผู้ใช้งานแล้ว');}
    public function edit(User $user){return view('admin.users.edit',['user'=>$user,'roles'=>Role::orderBy('name')->get()]);}
    public function update(Request $request, User $user){$data=$this->validated($request,$user,true);$role=$data['role'];unset($data['role']);if(!empty($data['password']))$data['password']=Hash::make($data['password']);else unset($data['password']);$user->update($data);$user->syncRoles([$role]);return redirect()->route('admin.users.index')->with('success','แก้ไขผู้ใช้งานแล้ว');}
    public function destroy(Request $request, User $user){if($request->user()->is($user))return back()->with('error','ไม่สามารถลบบัญชีของตนเองได้');$user->delete();return back()->with('success','ลบผู้ใช้งานแล้ว');}
    private function validated(Request $request,?User $user=null,bool $editing=false){return $request->validate(['name'=>'required|string|max:255','email'=>['required','email','max:255',Rule::unique('users')->ignore($user?->id)],'password'=>$editing?'nullable|string|min:8':'required|string|min:8','role'=>'required|exists:roles,name','phone'=>'nullable|max:50','address'=>'nullable|string','class_department'=>'nullable|max:255','subject_department'=>'nullable|max:255','status'=>'required|in:active,inactive']);}
}
