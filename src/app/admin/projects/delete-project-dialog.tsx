"use client";

import { Trash2, TriangleAlert } from "lucide-react";
import { ConfirmActionDialog } from "@/app/admin/confirm-action-dialog";
import { deleteProject } from "@/app/admin/actions";

type Props = {
  csrfToken: string;
  projectId: string;
  projectTitle: string;
};

export const DeleteProjectDialog = ({ csrfToken, projectId, projectTitle }: Props): React.JSX.Element => (
  <ConfirmActionDialog
    trigger={<button type="button" className="text-[11px] text-danger/70 transition-colors hover:text-danger">Delete</button>}
    icon={TriangleAlert}
    title="Delete case study?"
    description={
      <>
        This permanently deletes <span className="text-danger">{projectTitle}</span>{" "}
        along with its links and tech stack. This can&apos;t be undone.
      </>
    }
    confirmLabel="Delete permanently"
    confirmIcon={Trash2}
    variant="danger"
    formAction={deleteProject}
    hiddenFields={{ csrf: csrfToken, id: projectId }}
  />
);
