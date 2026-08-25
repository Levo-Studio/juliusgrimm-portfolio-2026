"use client";

import { EyeOff } from "lucide-react";
import { ConfirmActionDialog } from "@/app/admin/confirm-action-dialog";
import { toggleProjectVisibility } from "@/app/admin/actions";

type Props = {
  csrfToken: string;
  projectId: string;
  projectTitle: string;
};

export const UnpublishProjectDialog = ({ csrfToken, projectId, projectTitle }: Props): React.JSX.Element => (
  <ConfirmActionDialog
    trigger={<button type="button" className="text-fg-muted transition-colors hover:text-fg">Unpublish</button>}
    icon={EyeOff}
    title="Unpublish case study?"
    description={
      <>
        <span className="text-fg">{projectTitle}</span> disappears from the live site until you publish it again.
      </>
    }
    confirmLabel="Unpublish"
    confirmIcon={EyeOff}
    variant="default"
    formAction={toggleProjectVisibility}
    hiddenFields={{ csrf: csrfToken, id: projectId, visible: "false" }}
  />
);
