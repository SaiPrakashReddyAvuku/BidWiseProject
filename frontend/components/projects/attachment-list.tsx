import { Download } from "lucide-react";

type AttachmentListProps = {
  attachments: string[];
};

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value.trim());

const toDownloadHref = (attachment: string) => {
  if (isHttpUrl(attachment)) {
    return attachment;
  }

  const content = [
    "BidWise Attachment",
    `File: ${attachment}`,
    "",
    "Note: This is a downloadable placeholder in the current prototype.",
    "Real file binary storage will be enabled with backend file upload support."
  ].join("\n");

  return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
};

const toDownloadName = (attachment: string) => {
  const clean = attachment.trim();
  if (!clean) return "attachment.txt";
  return clean.includes(".") ? clean : `${clean}.txt`;
};

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (!attachments.length) {
    return <p className="text-muted-foreground">No attachments</p>;
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment, index) => {
        const href = toDownloadHref(attachment);
        const isExternal = isHttpUrl(attachment);

        return (
          <a
            key={`${attachment}-${index}`}
            href={href}
            download={isExternal ? undefined : toDownloadName(attachment)}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="flex items-center justify-between rounded-lg border border-white/25 bg-white/40 px-3 py-2 text-sm transition hover:bg-white/60 dark:bg-slate-900/35 dark:hover:bg-slate-900/55"
          >
            <span className="truncate">{attachment}</span>
            <span className="ml-3 inline-flex items-center gap-1 text-primary">
              <Download className="h-4 w-4" />
              Download
            </span>
          </a>
        );
      })}
    </div>
  );
}

