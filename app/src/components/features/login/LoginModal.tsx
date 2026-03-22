
import { Dialog, DialogContent, DialogProps, DialogTitle } from "@mui/material";
import LoginForm from "./LoginForm";

type LoginModalProps = DialogProps & {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal(props: LoginModalProps) {
  const handleLoginSuccess = () => {
    props.onClose();
    // Re-fetch user data
  }

  return (
    <Dialog {...props}>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </DialogContent>
    </Dialog>
  )
}
