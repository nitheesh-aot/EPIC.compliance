/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { formatS3Url } from "@/utils/appUtils";
import { Popover } from "@mui/material";
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
import React from "react";
import { Root, createRoot } from "react-dom/client";

// Add custom interface for div element with _reactRoot property
interface PopoverRootElement extends HTMLDivElement {
  _reactRoot?: Root;
}

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
      // Create wrapper for positioning
      const wrapper = document.createElement("span");
      wrapper.style.position = "relative";
      wrapper.style.cursor = "help";
      wrapper.appendChild(dom);

      // Create a unique ID for this mention element
      const mentionId = `mention-${Math.random().toString(36).substring(2, 11)}`;
      dom.id = mentionId;

      // Create React root for Popover
      const popoverRoot = document.createElement("div") as PopoverRootElement;
      popoverRoot.className = "mention-popover-root";
      document.body.appendChild(popoverRoot);

      // Create React component with Popover
      const renderPopover = () => {
        const MentionPopover = () => {
          const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(
            null
          );
          const open = Boolean(anchorEl);

          React.useEffect(() => {
            const mentionElement = document.getElementById(mentionId);

            const handleMouseEnter = (event: MouseEvent) => {
              setAnchorEl(event.currentTarget as HTMLElement);
            };

            const handleMouseLeave = () => {
              setAnchorEl(null);
            };

            if (mentionElement) {
              mentionElement.addEventListener("mouseenter", handleMouseEnter);
              mentionElement.addEventListener("mouseleave", handleMouseLeave);
            }

            // Cleanup function
            return () => {
              if (mentionElement) {
                mentionElement.removeEventListener(
                  "mouseenter",
                  handleMouseEnter
                );
                mentionElement.removeEventListener(
                  "mouseleave",
                  handleMouseLeave
                );
              }
            };
          }, []);

          // Cleanup the root when unmounted
          React.useEffect(() => {
            return () => {
              if (document.body.contains(popoverRoot)) {
                document.body.removeChild(popoverRoot);
              }
            };
          }, []);

          return (
            <Popover
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              onClose={() => setAnchorEl(null)}
              disableRestoreFocus
              disablePortal={false}
              disableAutoFocus
              disableEnforceFocus
              sx={{
                pointerEvents: "none",
              }}
              slotProps={{
                paper: {
                  elevation: 2,
                  sx: {
                    pointerEvents: "none",
                    outline: "none",
                    tabIndex: -1,
                  },
                },
              }}
              container={document.body}
            >
              <img
                src={formatS3Url(this.__imageRelativeUrl)}
                alt={this.__mention}
                style={{
                  maxWidth: "300px",
                  maxHeight: "240px",
                  objectFit: "contain",
                  borderRadius: "4px",
                  padding: "4px",
                  paddingBottom: "0px",
                }}
                tabIndex={-1}
              />
            </Popover>
          );
        };

        const root = createRoot(popoverRoot);
        root.render(<MentionPopover />);

        // Store root for cleanup
        popoverRoot._reactRoot = root;
      };

      // We need to wait for React to be available
      if (typeof window !== "undefined") {
        setTimeout(renderPopover, 0);
      }

      // Clean up when the element is removed
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "childList" &&
            Array.from(mutation.removedNodes).includes(wrapper)
          ) {
            if (document.body.contains(popoverRoot)) {
              // Unmount React component if exists
              if (popoverRoot._reactRoot) {
                popoverRoot._reactRoot.unmount();
              }
              document.body.removeChild(popoverRoot);
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
