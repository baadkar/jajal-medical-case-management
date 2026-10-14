<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\MedicalCase::class);
    }

    public function rules(): array
    {
        return [
            'case_number' => ['required', 'string', 'max:50', 'unique:cases,case_number'],
            'patient_reference' => ['required', 'string', 'max:50'],
            'surgeon_name' => ['required', 'string', 'max:255'],
            'implant_type' => ['required', 'string', 'max:255'],
            'status' => [
                'required',
                Rule::in(['Draft', 'Planning', 'In Review', 'Approved', 'Completed', 'Cancelled']),
            ],
            'priority' => [
                'required',
                Rule::in(['Low', 'Medium', 'High']),
            ],
            'surgery_date' => ['nullable', 'date'],
        ];
    }
}
