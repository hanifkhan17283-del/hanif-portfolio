import React, {useEffect, useRef} from "react";
import "./DetailsDialog.css";

export default function DetailsDialog({item, onClose}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!item) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        document.querySelectorAll(
          ".details-dialog button, .details-dialog a[href], .details-dialog input, .details-dialog select, .details-dialog textarea, .details-dialog [tabindex]:not([tabindex='-1'])"
        )
      ).filter(element => !element.disabled);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [item, onClose]);

  if (!item) {
    return null;
  }

  return (
    <div
      className="details-dialog-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="details-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-dialog-title"
      >
        <div className="details-dialog-heading">
          <h2 id="details-dialog-title">{item.title}</h2>
          <button
            ref={closeButtonRef}
            className="details-dialog-close"
            type="button"
            aria-label={`Close details for ${item.title}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="details-dialog-content">{item.children}</div>
      </section>
    </div>
  );
}
