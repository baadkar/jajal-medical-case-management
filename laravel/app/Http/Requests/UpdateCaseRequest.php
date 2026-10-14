<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('case'));
    }

    public function rules(): array
    {
        $caseId = $this->route('case') ? $this->route('case')->id : null;

        return [
            'case_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('cases', 'case_number')->ignore($caseId),
            ],
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
