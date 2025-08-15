import LoginForm from "../../../features/auth/components/LoginForm";
import AuthLayout from "../../../features/auth/layouts/AuthPageLayout";

const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
