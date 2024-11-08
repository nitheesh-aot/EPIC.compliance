import React, { useEffect, useRef, useCallback } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Include the default theme
import { Controller, useFormContext } from "react-hook-form";
import { Box, FormControl, InputLabel } from "@mui/material";

type ControlledRichTextEditorProps = {
  name: string;
  label: string;
  placeholder?: string;
};

const ControlledRichTextEditor: React.FC<ControlledRichTextEditorProps> = ({
  name,
  label,
  placeholder = "",
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null); // Reference to the Quill container
  const quillRef = useRef<Quill | null>(null); // Reference to the Quill instance

  const {
    control,
    setValue,
    formState: { errors, defaultValues },
  } = useFormContext();

  const insertImageToEditor = useCallback((imageUrl: string) => {
    const range = quillRef.current?.getSelection();
    if (range) {
      quillRef.current?.insertEmbed(range.index, "image", imageUrl);
    }
  }, []);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        try {
          // const signedUrl = await getSignedUrl();
          // await uploadImageToS3(file, signedUrl);
          // const imageUrl = signedUrl.split("?")[0];
          // insertImageToEditor(imageUrl);
          insertImageToEditor(
            "https://citz-gdx.objectstore.gov.bc.ca/epic-engage/f1bb940c-9b80-450d-a0eb-66ebf4f8f34e.png"
          );
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error uploading image:", error);
        }
      }
    };
  }, [insertImageToEditor]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: placeholder,
      modules: {
        toolbar: {
          container: [
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
          ],
          handlers: {
            image: handleImageUpload,
          },
        },
      },
    });

    if (defaultValues?.[name]?.html) {
      quillRef.current.root.innerHTML = defaultValues[name].html;
    }

    quillRef.current.on("text-change", () => {
      const htmlContent = quillRef.current?.root.innerHTML || "";
      const plainText = quillRef.current?.getText()?.trim() || "";
      setValue(name, { html: htmlContent, text: plainText });
    });
  }, [defaultValues, name, placeholder, setValue, handleImageUpload]);

  return (
    <FormControl fullWidth>
      <InputLabel
        sx={{
          position: "static",
          transform: "none",
          fontSize: "0.875rem",
          lineHeight: "1.5rem",
          color: "#474543",
        }}
        htmlFor={name}
        size="small"
      >
        {label}
      </InputLabel>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValues?.[name] ?? { html: "", text: "" }} // Set the default value for the form
        render={({ field }) => (
          <Box mt={"-2.15rem"}>
            <div
              ref={editorRef}
              style={{ minHeight: "180px" }}
              defaultValue={field.value.html || ""}
            />
            {errors[name] && <span>{errors[name]?.message?.toString()}</span>}
          </Box>
        )}
      />
    </FormControl>
  );
};

export default ControlledRichTextEditor;
