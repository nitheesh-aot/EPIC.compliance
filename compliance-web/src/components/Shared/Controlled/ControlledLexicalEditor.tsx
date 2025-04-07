import { useFormContext, Controller } from "react-hook-form";
import LexicalEditor from "@/components/Shared/LexicalEditor/LexicalEditor";
import { MentionData } from "@/components/Shared/LexicalEditor/LexicalUtils";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot } from "lexical";
import { useMemo, useEffect, useState } from "react";
import { FormControl, FormHelperText } from "@mui/material";

interface ExtendedFieldErrors {
  html: {
    message: string;
    ref: string;
    type: string;
  };
  text: {
    message: string;
    ref: string;
    type: string;
  };
}

export default function ControlledLexicalEditor({
  name,
  label,
  placeholder = "Enter text...",
  isAdvanced = false,
  height,
  mentionsList,
  isRequired = false,
}: {
  name: string;
  label: string;
  placeholder?: string;
  isAdvanced?: boolean;
  height?: string;
  mentionsList?: MentionData[];
  isRequired?: boolean;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // Add a memoized key that changes when the mentionsList changes
  const [mentionsKey, setMentionsKey] = useState<number>(0);

  useEffect(() => {
    // Update the mentions key whenever the mentionsList changes
    if (mentionsList) {
      setMentionsKey((prev) => prev + 1);
    }
  }, [mentionsList]);

  const errorMessage = useMemo(() => {
    const error = errors[name] as unknown as ExtendedFieldErrors;
    return error && error.text && error.text.message;
  }, [errors, name]);

  return (
    <FormControl fullWidth sx={{ marginBottom: "1.5rem" }}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <LexicalEditor
              name={name}
              label={label}
              isAdvanced={isAdvanced}
              errorMsg={errorMessage}
              placeholder={placeholder}
              defaultHtml={field.value?.html}
              height={height}
              mentionsList={mentionsList}
              key={`lexical-editor-mentions-${mentionsKey}`}
              onChange={(editorState, editor) => {
                editorState.read(() => {
                  const editorStateHtmlString = $generateHtmlFromNodes(editor);
                  const editorStateTextString = $getRoot()
                    .getTextContent()
                    ?.replace(/\n+/g, " ");
                  field.onChange({
                    html: editorStateHtmlString,
                    text: editorStateTextString,
                  });
                });
              }}
              isRequired={isRequired}
            />
            {errorMessage && (
              <FormHelperText
                error
                sx={{
                  fontSize: "0.875rem",
                  marginLeft: "0",
                }}
              >
                {errorMessage}
              </FormHelperText>
            )}
          </>
        )}
      />
    </FormControl>
  );
}
