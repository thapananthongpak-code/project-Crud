import PhoneForm from "@/components/PhoneForm";
import { useToast } from "@/components/Toast";
import { createPhone } from "@/api/phones";
import type { PhoneDraft } from "@/types/phone";
import { describeError } from "@/utils/crud-api";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Platform } from "react-native";

export default function AddPhone() {
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (draft: PhoneDraft) => {
    try {
      await createPhone(draft);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      if (router.canGoBack()) router.back();
      else router.replace("/");

      toast.show({ message: `${draft.name} added to your phonebook.`, tone: "success" });
    } catch (err) {
      toast.show({ message: describeError(err), tone: "error" });
    }
  };

  return (
    <PhoneForm
      title="New contact"
      subtitle="Add a classmate to your phonebook."
      submitLabel="Save contact"
      submitIcon="checkmark"
      onSubmit={handleSubmit}
    />
  );
}
