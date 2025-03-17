"""IR template related constants."""

INSPECTION_SCOPE = """<p class="editor-paragraph" dir="ltr">
    <span>The Officer inspected [Brief description of Project Components / Area inspected]</span>
</p>
<p class="editor-paragraph" dir="ltr">
    <span style="white-space: pre-wrap;">The inspection included a </span>
    <u><b><strong class="editor-text-bold editor-text-underline">
        debrief</strong></b></u>
    <span style="white-space: pre-wrap;"> of observations with Project staff on {{ debrief_date }}.</span>
</p>
<p class="editor-paragraph" dir="ltr">
    <span style="white-space: pre-wrap;">The following requirements were inspected against:</span>
</p>
<ol class="editor-list-ol">
    {% for req in requirements %}
    <li value="1" class="editor-listitem">
        <span style="white-space: pre-wrap;">{{ req }}.</span>
    </li>
    {% endfor %}
</ol>
<p class="editor-paragraph" dir="ltr">
    <br>
</p>"""

FINDING_STATEMENT = """<p class="editor-paragraph" dir="ltr">
    <span>Additional detail regarding these findings may be found in the sections below.</span>
</p>
<p class="editor-paragraph">
    <br>
</p>
<p class="editor-paragraph" dir="ltr">
    <span>
        The compliance findings in this report reflect the analysis based on the information obtained
        during the inspection commenced on the date noted above. These findings can change at any time
        upon information gathered through future inspections or if new information is obtained by the
        EAO Compliance and Enforcement Branch (CEB).
    </span>
</p>
"""

PRELIMINARY_REVIEW_DETAILS = """<div>
    <p class="editor-paragraph" dir="ltr">
        <span>
            On {{ date_report_sent}} ., Officer [Lombardi] provided the preliminary
            inspection record to the {{ proponent_label }}.
        AND</span><br><span>On {{ date_repsonse }} ., the {{ proponent_label }}
            provided comments pertaining to the preliminary inspection record. These comments were reviewed, and edits
            were made to the record by the EAO Compliance and Enforcement Branch (CEB) to correct identified errors of
            fact or omission prior to finalizing. </span>
    </p>
    <p class="editor-paragraph" dir="ltr"><span>OR</span></p>
    <p class="editor-paragraph" dir="ltr"><span>On {{ date_response }} ., the {{ proponent_label }} provided comments
            pertaining to the preliminary inspection record. These comments were reviewed by the EAO Compliance and
            Enforcement Branch (CEB). No errors of fact or omission were identified.</span></p>
    <p class="editor-paragraph" dir="ltr"><span>OR</span></p>
    <p class="editor-paragraph" dir="ltr"><span>No comments were received from the {{ proponent_label }} prior to
            finalizing the record.</span></p>
</div>
"""

ACTION_REQUIRED_BY_RP = """<p class="editor-paragraph" dir="ltr"><b><strong class="editor-text-bold">Please review
this inspection record for errors or omissions and provide a response to Officer {{ primary_officer }}
by</strong></b>
{% if date_expected_return %}
    {{ date_expected_return }}
{% else %}
    <span style="color: gray;">date will appear once due date is set.</span>
{% endif %}
</p>"""
