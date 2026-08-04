import { updatePhone } from "@/api/phones";
import PhoneForm from "@/components/PhoneForm";
import { useToast } from "@/components/Toast";
import type { PhoneDraft } from "@/types/phone";
import { describeError } from "@/utils/crud-api";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform } from "react-native";

/** Route params always arrive as string | string[] — collapse them safely. */
function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function EditPhone() {
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    sect?: string;
    tel?: string;
  }>();

  const id = param(params.id);

  const handleSubmit = async (draft: PhoneDraft) => {
    if (!id) {
      toast.show({ message: "That contact is missing an id.", tone: "error" });
      return;
    }

    try {
      await updatePhone(id, draft);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      if (router.canGoBack()) router.back();
      else router.replace("/");

      toast.show({ message: `${draft.name} updated.`, tone: "success" });
    } catch (err) {
      toast.show({ message: describeError(err), tone: "error" });
    }
  };

  return (
    <PhoneForm
      title="Edit contact"
      subtitle="Update the details and save your changes."
      submitLabel="Save changes"
      submitIcon="save"
      avatarSeed={id}
      initial={{
        name: param(params.name),
        sect: param(params.sect),
        tel: param(params.tel),
      }}
      onSubmit={handleSubmit}
    />
  );
}
