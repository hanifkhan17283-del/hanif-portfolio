import React from "react";
import ReactDOM from "react-dom";
import {act} from "react-dom/test-utils";
import AdminApp, {createGmailComposeUrl} from "./AdminApp";

async function renderInbox(message) {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const originalFetch = global.fetch;
  const response = body => ({
    ok: true,
    json: async () => body
  });

  global.fetch = jest.fn(path => {
    if (path === "/api/admin/csrf") {
      return Promise.resolve(response({csrfToken: "test-csrf"}));
    }
    if (path === "/api/admin/session") {
      return Promise.resolve(
        response({authenticated: true, email: "admin@example.com"})
      );
    }
    if (path === "/api/admin/stats") {
      return Promise.resolve(
        response({total: 1, unread: 0, read: 1, replied: 0, email_failures: 0})
      );
    }
    if (path.startsWith("/api/admin/messages?")) {
      return Promise.resolve(
        response({
          messages: [{...message, preview: message.message}],
          total: 1
        })
      );
    }
    if (path === `/api/admin/messages/${message.id}`) {
      return Promise.resolve(response({message}));
    }
    throw new Error(`Unexpected test request: ${path}`);
  });

  await act(async () => {
    ReactDOM.render(<AdminApp />, div);
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  await act(async () => {
    div.querySelector(".admin-message-row").click();
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  return {
    div,
    cleanup: () => {
      ReactDOM.unmountComponentAtNode(div);
      div.remove();
      global.fetch = originalFetch;
    }
  };
}

test("builds a Gmail compose URL with encoded message details", () => {
  const message = {
    email: "visitor+portfolio@example.com",
    name: "Alex & Co",
    subject: "Website redesign? Yes",
    message: "Please review A&B <C>."
  };

  const url = new URL(createGmailComposeUrl(message));
  const params = url.searchParams;

  expect(url.origin + url.pathname).toBe("https://mail.google.com/mail/");
  expect(params.get("view")).toBe("cm");
  expect(params.get("fs")).toBe("1");
  expect(params.get("to")).toBe(message.email);
  expect(params.get("su")).toBe("Re: Website redesign? Yes");
  expect(params.get("body")).toContain("Hi Alex & Co,");
  expect(params.get("body")).toContain(message.message);
});

test("does not create a reply URL when the recipient email is missing", () => {
  expect(createGmailComposeUrl({email: "  "})).toBe("");
});

test("opens Gmail compose from the authenticated inbox reply button", async () => {
  const message = {
    id: 42,
    email: "visitor@example.com",
    name: "Alex",
    subject: "Portfolio work",
    message: "Please contact me.",
    project_type: "Other",
    status: "read",
    email_status: "sent",
    email_attempts: 1,
    email_error: "",
    replied_at: null,
    created_at: "2026-10-12T00:00:00Z"
  };
  const {div, cleanup} = await renderInbox(message);
  const open = jest.spyOn(window, "open").mockImplementation(() => null);

  try {
    await act(async () => {
      Array.from(div.querySelectorAll("button"))
        .find(button => button.textContent.trim() === "Reply by email")
        .click();
    });
    expect(open).toHaveBeenCalledTimes(1);
    const [url, target] = open.mock.calls[0];
    expect(new URL(url).origin).toBe("https://mail.google.com");
    expect(new URL(url).searchParams.get("to")).toBe(message.email);
    expect(new URL(url).searchParams.get("su")).toBe(`Re: ${message.subject}`);
    expect(target).toBe("_blank");
  } finally {
    open.mockRestore();
    cleanup();
  }
});

test("shows an error instead of opening Gmail if the selected inquiry has no email", async () => {
  const message = {
    id: 43,
    email: "",
    name: "Alex",
    subject: "No reply address",
    message: "A message without an email.",
    project_type: "Other",
    status: "read",
    email_status: "sent",
    email_attempts: 1,
    email_error: "",
    replied_at: null,
    created_at: "2026-10-12T00:00:00Z"
  };
  const {div, cleanup} = await renderInbox(message);
  const open = jest.spyOn(window, "open").mockImplementation(() => null);

  try {
    await act(async () => {
      Array.from(div.querySelectorAll("button"))
        .find(button => button.textContent.trim() === "Reply by email")
        .click();
    });
    expect(open).not.toHaveBeenCalled();
    expect(div.querySelector('[role="alert"]').textContent).toMatch(
      /does not have an email address/
    );
  } finally {
    open.mockRestore();
    cleanup();
  }
});
