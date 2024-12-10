<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Record;
use Inertia\Inertia;
use Inertia\Response;

class RecordsController extends Controller
{
    public function index(Request $request)
    {   
        // return Inertia::render('Records');
        // error_log(env("NID_PUBLIC_API_KEY"));
        Log::info('Records Page', [$request->method(), $request->ip(), Auth::user()]);
        return Inertia::render('Records', [
            'NID_PUBLIC_API_KEY' => env("NID_PUBLIC_API_KEY")
        ]);
    }

    public function search(Request $request){
        Log::info('Records Page - Search', [$request->method(), $request->ip(), Auth::user()]);

        

        if($request->suffix == ''){
            $request['suffix'] = 'N/A';
        }

        $searchParams = [
            ['first_name', '=', $request->first_name],
            ['last_name', '=', $request->last_name],
            ['extension', '=', $request->suffix],
            ['date_of_birth', '=', $request->birth_date]
        ];

        if($request->no_middle_name == false){
            $searchParams[] = ['middle_name', '=', $request->middle_name];
        }
        // error_log($request->no_middle_name);
        
        $dataRes = Record::where($searchParams)->first();
        if($dataRes){
            if($dataRes['extension'] == 'N/A'){
                $dataRes['extension'] = "";
            }
        }

        return $dataRes;
    }

    public function store(Request $request)
    {
        // User::create($request->validate([
        //   'first_name' => ['required', 'max:50'],
        //   'last_name' => ['required', 'max:50'],
        //   'email' => ['required', 'max:50', 'email'],
        // ]));

        // return to_route('users.index');
    }

    public function validate(Request $request){
        Log::info('Records Page - Validate', [$request->method(), $request->ip(), Auth::user()]);

        $authorizeResponse = Http::post('https://ws.everify.gov.ph/api/auth', [
            'client_id' => env("NID_CLIENT_ID"),
            'client_secret' => env("NID_CLIENT_SECRET")
        ]);

        if(json_decode($authorizeResponse)->data->access_token){
            $queryResponse = Http::withToken(json_decode($authorizeResponse)->data->access_token)->post('https://ws.everify.gov.ph/api/query',[
                "first_name" => $request->first_name,
                "middle_name" => $request->middle_name,
                "last_name" => $request->last_name,
                "suffix" => $request->suffix,
                "birth_date" =>  $request->birth_date,
                "face_liveness_session_id" => $request->face_liveness_session_id
            ]);
            return json_decode($queryResponse)->data;
        }  
    }
}
