import { useFormContext, Controller } from "react-hook-form";
import LexicalEditor from "@/components/Shared/LexicalEditor/LexicalEditor";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot } from "lexical";
import { useMemo } from "react";
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
}: {
  name: string;
  label: string;
  placeholder?: string;
  isAdvanced?: boolean;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

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
