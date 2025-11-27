// frontend/src/pages/auth/Login.jsx
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { BrainCircuit } from 'lucide-react';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Promesa para mostrar feedback visual de carga
    const loginPromise = login(data.email, data.password);

    toast.promise(loginPromise, {
      loading: 'Validando credenciales...',
      success: '¡Bienvenido a MentorIA!',
      error: (err) => err.message || 'Error al iniciar sesión'
    });

    const result = await loginPromise;
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light px-4 relative overflow-hidden">
      {/* Decoración de fondo (Círculos abstractos) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md relative z-10 border border-gray-100">
        
        {/* Header del Login */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-4 text-primary">
            <BrainCircuit size={40} />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">MentorIA</h1>
          <p className="text-text-muted">Gestión educativa potenciada por IA</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="ejemplo@mentoria.edu.pe"
            {...register("email", { 
              required: "El correo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo electrónico inválido"
              }
            })}
            error={errors.email}
          />

          <div className="space-y-1">
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              {...register("password", { required: "La contraseña es obligatoria" })}
              error={errors.password}
            />
            <div className="flex justify-end">
              <a href="#" className="text-xs text-primary hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="secondary" // Amarillo Mostaza
            className="w-full py-3 text-lg font-bold shadow-lg shadow-secondary/20"
            isLoading={isSubmitting}
          >
            Ingresar
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text-muted">
          ¿Aún no tienes cuenta?{' '}
          <a href="#" className="text-primary font-bold hover:underline">
            Regístrate aquí
          </a>
        </div>
      </div>
    </div>
  );
}