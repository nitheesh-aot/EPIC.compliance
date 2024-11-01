import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Include the default theme
import { Controller, useFormContext } from "react-hook-form";

type ControlledRichTextEditorProps = {
  name: string;
  label: string;
  placeholder?: string;
};

const ControlledRichTextEditor: React.FC<ControlledRichTextEditorProps> = ({
  name,
  label,
  placeholder = "Enter text...",
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null); // Reference to the Quill container
  const quillRef = useRef<Quill | null>(null); // Reference to the Quill instance

  const {
    control,
    setValue,
    formState: { errors, defaultValues },
  } = useFormContext();

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    // Initialize Quill editor
    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: placeholder,
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
          ],
          handlers: {
            image: () => {
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
            },
          },
        },
      },
    });

    const insertImageToEditor = (imageUrl: string) => {
      const range = quillRef.current?.getSelection();
      if (range) {
        quillRef.current?.insertEmbed(range.index, "image", imageUrl);
      }
    };

    if (defaultValues?.[name]?.html) {
      quillRef.current.root.innerHTML = defaultValues[name].html;
    }

    // Set initial form value if there's any
    if (quillRef.current) {
      quillRef.current.on("text-change", () => {
        const htmlContent = quillRef.current?.root.innerHTML || "";
        const plainText = quillRef.current?.getText()?.trim() || "";

        setValue(name, { html: htmlContent, text: plainText });
      });
    }
  }, [defaultValues, name, placeholder, setValue]);

  return (
    <div>
      <label>{label}</label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValues?.[name] ?? { html: "", text: "" }} // Set the default value for the form
        render={({ field }) => (
          <>
            <div
              ref={editorRef}
              style={{ minHeight: "180px" }}
              defaultValue={field.value.html || ""}
            />
            {/* Quill container */}
            {errors[name] && <span>{errors[name]?.message?.toString()}</span>}
          </>
        )}
      />
    </div>
  );
};

export default ControlledRichTextEditor;
