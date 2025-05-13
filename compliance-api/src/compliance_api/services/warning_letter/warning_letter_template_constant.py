"""Warning Letter Constant."""

WARNING_LETTER_CONTENT = """<p class='editor-paragraph' dir='ltr'>
<strong>SENT VIA EMAIL</strong></p>
<div class="address-block">
    <p>
        NAME<br>
        TITLE<br>
        COMPANY<br>
        ADDRESS<br>
        CITY PROVINCE POSTAL CODE
    </p>
</div>
<p>Dear [NAME],</p>
<p><strong>RE: Warning for Non-Compliance with {{requirement_details[0].requirement_source_number}}
 of Environmental Assessment Certificate # {{project_details.eac_certificate}}</strong></p>
<p>
    On {{ inspection_details.start_date }}, {{inspection_details.officer_position}}
     {{ inspection_details.officer_name }} conducted a {{inspection_details.inspection_type}}
     inspection (Inspection) of the {{ project_details.name }} (Project) against the requirements of
      {{ requirement_sources }}. Based on information obtained during the Inspection, it was determined
       that the {{project_details.proponent}}, {{ project_details.proponent }} (the Holder) is not compliant
        with {{condition_lines}}. It was also determined that the {{project_details.proponent}},
         {{project_details.proponent}} (the Holder) is not compliant with {{condition_lines}}.
</p>
{% for requirement in requirement_details %}
<p>
    {{requirement.requirement_source_number}} requires the Holder to {{requirement.requirement_summary}}.
</p>
{% endfor %}
<p>
    The inspection findings are documented in Inspection Record {{ inspection_details.ir_number }}.
</p>
<p>
    The Holder is hereby <strong>WARNED</strong> that the Project is not compliant with {{condition_numbers}} of the
     {{requirement_sources}}.
    The maximum penalty for failure to comply with an Environmental Assessment Certificate is $1,000,000 and, on each
    subsequent conviction, a fine of not more than $2,000,000.
</p>
<p>
    The Environmental Assessment Office Compliance and Enforcement Branch will continue to monitor this issue and may
    follow-up with further inspections as required. Future or continuing non-compliance may result in additional
    enforcement action as warranted.
</p>
<p>
    Please contact me at {{department_details.phone}} or via email at <a href="mailto:{{ department_details.email }}">
    {{ department_details.email }}
    </a> if you have any questions.
</p>
<div class="signature-block">
    <p>Sincerely,</p>
    <p>{{ inspection_details.officer_name }}<br>
    {{inspection_details.officer_position}}<br>
    Environmental Assessment Office</p>
</div>
<p><strong>cc:</strong> EAO Compliance</p>
</p>"""
