/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { LexicalEditor } from "lexical";
import * as React from "react";

import {
  MAX_ALLOWED_FONT_SIZE,
  MIN_ALLOWED_FONT_SIZE,
  updateFontSize,
  updateFontSizeInSelection,
  UpdateFontSizeType,
} from "./LexicalUtils";
import { IconButton, TextField } from "@mui/material";
import { AddRounded, RemoveRounded } from "@mui/icons-material";

export default function LexicalFontSize({
  selectionFontSize,
  disabled,
  editor,
}: {
  selectionFontSize: string;
  disabled: boolean;
  editor: LexicalEditor;
}) {
  const [inputValue, setInputValue] = React.useState<string>("");
  const [inputChangeFlag, setInputChangeFlag] = React.useState<boolean>(false);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const inputValueNumber = Number(inputValue);

    if (e.key === "Tab") {
      return;
    }
    if (["e", "E", "+", "-"].includes(e.key) || isNaN(inputValueNumber)) {
      e.preventDefault();
      setInputValue("");
      return;
    }
    setInputChangeFlag(true);
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();

      updateFontSizeByInputValue(inputValueNumber);
    }
  };

  const handleInputBlur = () => {
    if (inputValue !== "" && inputChangeFlag) {
      const inputValueNumber = Number(inputValue);
      updateFontSizeByInputValue(inputValueNumber);
    }
  };

  const updateFontSizeByInputValue = (inputValueNumber: number) => {
    let updatedFontSize = inputValueNumber;
    if (inputValueNumber > MAX_ALLOWED_FONT_SIZE) {
      updatedFontSize = MAX_ALLOWED_FONT_SIZE;
    } else if (inputValueNumber < MIN_ALLOWED_FONT_SIZE) {
      updatedFontSize = MIN_ALLOWED_FONT_SIZE;
    }

    setInputValue(String(updatedFontSize));
    updateFontSizeInSelection(editor, String(updatedFontSize) + "px", null);
    setInputChangeFlag(false);
  };

  React.useEffect(() => {
    setInputValue(selectionFontSize.replace("px", ""));
  }, [selectionFontSize]);

  return (
    <>
      <IconButton
        disabled={
          disabled ||
          (selectionFontSize !== "" &&
            Number(inputValue) <= MIN_ALLOWED_FONT_SIZE)
        }
        onClick={() =>
          updateFontSize(editor, UpdateFontSizeType.decrement, inputValue)
        }
        aria-label="Decrease font size"
        title={`Decrease font size`}
        size="small"
      >
        <RemoveRounded sx={{ fontSize: 20 }} />
      </IconButton>

      <TextField
        type="number"
        title="Font size"
        variant="outlined"
        value={inputValue}
        disabled={disabled}
        inputProps={{
          min: MIN_ALLOWED_FONT_SIZE,
          max: MAX_ALLOWED_FONT_SIZE,
          maxLength: 2,
          inputMode: "numeric",
          pattern: "[0-9]*",
        }}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleInputBlur}
        size="small"
        sx={{
          mb: 0,
          "& .MuiInputBase-sizeSmall": {
            height: "24px !important",
          },
          "& .MuiInputBase-input": {
            padding: "2px 6px !important",
            height: "20px !important",
          },
          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
        }}
      />

      <IconButton
        disabled={
          disabled ||
          (selectionFontSize !== "" &&
            Number(inputValue) >= MAX_ALLOWED_FONT_SIZE)
        }
        onClick={() =>
          updateFontSize(editor, UpdateFontSizeType.increment, inputValue)
        }
        aria-label="Increase font size"
        title={`Increase font size`}
        size="small"
      >
        <AddRounded sx={{ fontSize: 20 }} />
      </IconButton>
    </>
  );
}
