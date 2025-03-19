/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { formatS3Url } from "@/utils/appUtils";
import {
  $applyNodeReplacement,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from "lexical";

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    imageRelativeUrl: string;
  },
  SerializedTextNode
>;

function $convertMentionElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const textContent = domNode.textContent;
  const mentionName = domNode.getAttribute("data-lexical-mention-name");
  const imageUrl = domNode.getAttribute("data-imageurl");

  if (textContent !== null) {
    const node = $createMentionNode(
      typeof mentionName === "string" ? mentionName : textContent,
      textContent,
      imageUrl ?? undefined
    );
    return {
      node,
    };
  }

  return null;
}

const mentionStyle = "background-color: rgba(24, 119, 232, 0.2)";
export class MentionNode extends TextNode {
  __mention: string;
  __imageRelativeUrl: string;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(
      node.__mention,
      node.__text,
      node.__imageRelativeUrl,
      node.__key
    );
  }
  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    return $createMentionNode(serializedNode.mentionName).updateFromJSON(
      serializedNode
    );
  }

  constructor(
    mentionName: string,
    text?: string,
    imageRelativeUrl?: string,
    key?: NodeKey
  ) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
    this.__imageRelativeUrl = imageRelativeUrl ?? "";
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      imageRelativeUrl: this.__imageRelativeUrl,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.style.cssText = mentionStyle;
    dom.className = "mention";
    dom.spellcheck = false;
    dom.dataset.imageurl = this.__imageRelativeUrl;
    dom.dataset.mention = this.__mention;

    // Add image preview on hover functionality
    if (this.__imageRelativeUrl) {
      // Create wrapper for positioning (needed for reference point)
      const wrapper = document.createElement("span");
      wrapper.style.position = "relative";
      wrapper.style.cursor = "help";
      wrapper.appendChild(dom);

      // Create the image preview element - will be moved to body
      const preview = document.createElement("img");
      preview.src = formatS3Url(this.__imageRelativeUrl);
      preview.alt = this.__mention;
      preview.style.cssText = `
        position: fixed;
        display: none;
        max-width: 300px;
        max-height: 240px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        background-color: white;
        object-fit: contain;
        z-index: 99999;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      `;

      // Show preview on hover with absolute positioning to body
      dom.addEventListener("mouseenter", () => {
        // Ensure the preview is in the document body
        if (!document.body.contains(preview)) {
          document.body.appendChild(preview);
        }

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Get element position in viewport
        const rect = dom.getBoundingClientRect();

        // Calculate available space in each direction
        const spaceTop = rect.top;
        const spaceBottom = viewportHeight - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = viewportWidth - rect.right;

        // Reset all position properties
        preview.style.top = "";
        preview.style.bottom = "";
        preview.style.left = "";
        preview.style.right = "";
        preview.style.transform = "";

        // Make the preview temporarily visible but with opacity 0 to get its dimensions
        preview.style.display = "block";
        preview.style.opacity = "0";

        // Wait for the browser to calculate dimensions
        setTimeout(() => {
          const previewRect = preview.getBoundingClientRect();
          const previewWidth = previewRect.width || 300; // Fallback if not yet rendered
          const previewHeight = previewRect.height || 240; // Fallback if not yet rendered

          // Determine best position (prioritize: top > bottom > right > left)
          if (
            spaceTop >= previewHeight ||
            spaceTop >= Math.max(spaceBottom, spaceRight, spaceLeft)
          ) {
            // Position on top
            preview.style.top = `${rect.top - previewHeight - 5}px`;
            preview.style.left = `${rect.left + rect.width / 2 - previewWidth / 2}px`;

            // Prevent left edge clipping
            if (rect.left + rect.width / 2 - previewWidth / 2 < 5) {
              preview.style.left = "5px";
            }

            // Prevent right edge clipping
            if (
              rect.left + rect.width / 2 + previewWidth / 2 >
              viewportWidth - 5
            ) {
              preview.style.left = `${viewportWidth - previewWidth - 5}px`;
            }
          } else if (
            spaceBottom >= previewHeight ||
            spaceBottom >= Math.max(spaceRight, spaceLeft)
          ) {
            // Position on bottom
            preview.style.top = `${rect.bottom + 5}px`;
            preview.style.left = `${rect.left + rect.width / 2 - previewWidth / 2}px`;

            // Prevent left edge clipping
            if (rect.left + rect.width / 2 - previewWidth / 2 < 5) {
              preview.style.left = "5px";
            }

            // Prevent right edge clipping
            if (
              rect.left + rect.width / 2 + previewWidth / 2 >
              viewportWidth - 5
            ) {
              preview.style.left = `${viewportWidth - previewWidth - 5}px`;
            }
          } else if (spaceRight >= previewWidth || spaceRight >= spaceLeft) {
            // Position on right
            preview.style.left = `${rect.right + 5}px`;
            preview.style.top = `${rect.top + rect.height / 2 - previewHeight / 2}px`;

            // Prevent bottom edge clipping
            if (
              rect.top + rect.height / 2 + previewHeight / 2 >
              viewportHeight - 5
            ) {
              preview.style.top = `${viewportHeight - previewHeight - 5}px`;
            }

            // Prevent top edge clipping
            if (rect.top + rect.height / 2 - previewHeight / 2 < 5) {
              preview.style.top = "5px";
            }
          } else {
            // Position on left
            preview.style.left = `${rect.left - previewWidth - 5}px`;
            preview.style.top = `${rect.top + rect.height / 2 - previewHeight / 2}px`;

            // Prevent bottom edge clipping
            if (
              rect.top + rect.height / 2 + previewHeight / 2 >
              viewportHeight - 5
            ) {
              preview.style.top = `${viewportHeight - previewHeight - 5}px`;
            }

            // Prevent top edge clipping
            if (rect.top + rect.height / 2 - previewHeight / 2 < 5) {
              preview.style.top = "5px";
            }

            // If not enough space on left, try right instead
            if (spaceLeft < previewWidth * 0.6) {
              preview.style.left = "5px";
            }
          }

          // Make visible after correct positioning
          preview.style.opacity = "1";
        }, 10);
      });

      // Hide preview when mouse leaves
      dom.addEventListener("mouseleave", () => {
        preview.style.opacity = "0";
        setTimeout(() => {
          if (preview.style.opacity === "0") {
            preview.style.display = "none";
            // Optionally remove from DOM when not in use
            if (document.body.contains(preview)) {
              document.body.removeChild(preview);
            }
          }
        }, 200);
      });

      // Clean up preview when element is removed from DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "childList" &&
            Array.from(mutation.removedNodes).includes(wrapper)
          ) {
            if (document.body.contains(preview)) {
              document.body.removeChild(preview);
            }
            observer.disconnect();
          }
        });
      });

      // Start observing the DOM for changes to clean up properly
      observer.observe(wrapper.parentNode || document.body, {
        childList: true,
      });

      return wrapper;
    }

    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-mention", "true");
    element.setAttribute("data-imageurl", this.__imageRelativeUrl);
    element.setAttribute("data-mention", this.__mention);
    if (this.__text !== this.__mention) {
      element.setAttribute("data-lexical-mention-name", this.__mention);
    }
    element.textContent = this.__text;
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-mention")) {
          return null;
        }
        return {
          conversion: $convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

export function $createMentionNode(
  mentionName: string,
  textContent?: string,
  imageRelativeUrl?: string
): MentionNode {
  const mentionNode = new MentionNode(
    mentionName,
    textContent,
    imageRelativeUrl
  );
  mentionNode.setMode("segmented").toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode;
}
