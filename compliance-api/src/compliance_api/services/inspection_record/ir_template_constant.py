"""IR template related constants."""

INSPECTION_SCOPE = """<p class="editor-paragraph" dir="ltr"></p>
<span>
    The Officer inspected [Brief description of Project Components / Area inspected]</span>
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
