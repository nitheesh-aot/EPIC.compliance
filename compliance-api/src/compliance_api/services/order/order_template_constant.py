"""Order template constants."""

WHERE_AS = """<p class="editor-paragraph" dir="ltr" style="text-align: left;"><b><strong class="editor-text-bold"
            style="white-space: pre-wrap;">WHEREAS:</strong></b></p>
<p class="editor-paragraph" style="text-align: left;"><br></p>
<p class="editor-paragraph" dir="ltr" style="text-align: left;"><span style="white-space: pre-wrap;">A. {{project_name}} (Project) is a reviewable project under the </span><i><em
            class="editor-text-italic" style="white-space: pre-wrap;">Environmental Assessment Act</em></i><span
        style="white-space: pre-wrap;"> (the Act).</span></p>
<p class="editor-paragraph" style="text-align: left;"><br></p>
<p class="editor-paragraph" dir="ltr" style="text-align: left;"><span style="white-space: pre-wrap;">B. Environmental
        Assessment (EA) Certificate {{ea_certificate}} held by {{proponent_name}} ({{proponent_label}}) for the Project has
        requirements in {{conditions}} of {{requirement_sources}} with respect to {{requirement_summarys}}.</span>
</p>
<p class="editor-paragraph" style="text-align: left;"><br></p>
<p class="editor-paragraph" dir="ltr" style="text-align: left;"><span style="white-space: pre-wrap;">C. On {{start_date}} and {{end_date}}, the Environmental Assessment Office Compliance and Enforcement Branch (EAO CEB) conducted a
        {{inspection_type}} inspection of the Project. The inspection found that the {{proponent_label}} was not compliant
        with {{conditions}} with respect to {{requirement_summarys}}. The inspection findings are documented in
        Inspection Record {{ir_number}}.</span></p>
<p class="editor-paragraph" style="text-align: left;"><br></p>
<p class="editor-paragraph" dir="ltr" style="text-align: left;"><span style="white-space: pre-wrap;">D. Section {{section}} of
        the Act specifies that the Chief Executive Assessment Officer may order the {{proponent_label}} to</span></p>
<p class="editor-paragraph" style="text-align: left;"><br></p>
<p class="editor-paragraph" dir="ltr" style="text-align: left;"><i><em class="editor-text-italic"
            style="white-space: pre-wrap;">stop doing something that is or is likely to be in contravention of the Act,
            the certificate or the order, or cause it to be stopped</em></i><br><i><em class="editor-text-italic"
            style="white-space: pre-wrap;">OR</em></i><br><i><em class="editor-text-italic"
            style="white-space: pre-wrap;">take any measure that the Chief Executive Assessment Officer considers
            necessary in order to comply with the Act, the certificate or exemption order to mitigate the effects of
            non-compliance.</em></i><br><i><em class="editor-text-italic"
            style="white-space: pre-wrap;">OR</em></i><br><i><em class="editor-text-italic"
            style="white-space: pre-wrap;">cease, either altogether or to the extent specified by the Chief Executive
            Assessment Officer.</em></i></p>"""
NOW_THEREFORE = """<p class="editor-paragraph" dir="ltr" style="text-align: left;"><b><strong class="editor-text-bold"
            style="white-space: pre-wrap;">NOW THEREFORE:</strong></b></p>
<p class="editor-paragraph" style="text-align: left;"><br></p>
<p class="editor-paragraph" dir="ltr" style="text-align: left;"><span style="white-space: pre-wrap;">Pursuant to Section
        {{section}} of the Act, I order that the {{proponent_label}} must by [YYYY-DD-MM]</span></p>
<ol class="editor-list-ol">
    <li value="1" class="editor-listitem"><span style="white-space: pre-wrap;">XX</span></li>
    <li value="2" class="editor-listitem"><span style="white-space: pre-wrap;">XX</span></li>
    <li value="3" class="editor-listitem"><span style="white-space: pre-wrap;">XX</span></li>
    <li value="4" class="editor-listitem"><span style="white-space: pre-wrap;">Complete the measures in clauses 1, 2 and
            3 above to the satisfaction of, and unless otherwise authorized by, the EAO Compliance and Enforcement
            Branch.</span></li>
</ol>"""
