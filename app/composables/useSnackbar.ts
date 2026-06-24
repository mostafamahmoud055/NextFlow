import { ref } from "vue";
import isError from "../utils/isError";
import isSuccess from "../utils/isSuccess";

const snackbar = ref(false);
const text = ref("");
const color = ref("success");
const timeout = ref(2500);

export const useSnackbar = () => {
  const showSnackbar = (
    message,
    statusCode = 200,
    duration = 2500
  ) => {
    text.value = message;
    timeout.value = duration;

    if (isError(statusCode)) {
      color.value = "error";
    }

    if (isSuccess(statusCode)) {
      color.value = "success";
    }

    snackbar.value = true;
  };

  return {
    snackbar,
    text,
    color,
    timeout,
    showSnackbar,
  };
};