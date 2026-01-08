import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { User, Mail, Calendar, Briefcase, ArrowRight, Loader2 } from 'lucide-react';

// Form Validation Schema
const onboardingSchema = z.object({
    recruit_name: z.string().min(2, "Name is required"),
    recruit_email: z.string().email("Invalid email"),
    role: z.string().min(2, "Role is required"),
    start_date: z.string().refine((date) => new Date(date) > new Date(), {
        message: "Start date must be in the future",
    }),
    template_id: z.string().uuid("Please select a template"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface Template {
    id: string;
    name: string;
    description: string;
    task_count?: number;
}

export function NewOnboardingPage() {
    const { session } = useAuth();
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OnboardingFormValues>({
        resolver: zodResolver(onboardingSchema),
    });

    const selectedTemplateId = watch('template_id');

    useEffect(() => {
        async function fetchTemplates() {
            try {
                // Fetch templates with a count of tasks (if possible via join, or just raw)
                // Simple fetch for now
                const { data, error } = await supabase
                    .from('templates')
                    .select('id, name, description');

                if (error) throw error;
                setTemplates(data || []);

                // Auto-select first if available
                if (data && data.length > 0) {
                    setValue('template_id', data[0].id);
                }
            } catch (error) {
                console.error('Error fetching templates:', error);
            } finally {
                setIsLoadingTemplates(false);
            }
        }

        if (session?.user) {
            fetchTemplates();
        }
    }, [session, setValue]);

    const onSubmit = async (data: OnboardingFormValues) => {
        setIsSubmitting(true);
        try {
            const { data: userCompany } = await supabase
                .from('users')
                .select('company_id')
                .eq('id', session?.user.id)
                .single();

            if (!userCompany?.company_id) throw new Error("No company found for user");

            // 1. Create Onboarding
            const { data: onboarding, error: onboardingError } = await supabase
                .from('onboardings')
                .insert({
                    company_id: userCompany.company_id,
                    template_id: data.template_id,
                    recruit_name: data.recruit_name,
                    recruit_email: data.recruit_email,
                    role: data.role,
                    start_date: data.start_date,
                    manager_id: session?.user.id,
                    status: 'pending',
                    progress_percentage: 0
                })
                .select()
                .single();

            if (onboardingError) throw onboardingError;

            // 2. Copy Tasks from Template to Onboarding
            // First fetch template tasks
            const { data: templateTasks } = await supabase
                .from('tasks')
                .select('*')
                .eq('template_id', data.template_id);

            if (templateTasks && templateTasks.length > 0) {
                const newTasks = templateTasks.map(task => ({
                    onboarding_id: onboarding.id,
                    title: task.title,
                    description: task.description,
                    section: task.section,
                    deadline_days: task.deadline_days,
                    order: task.order,
                    is_completed: false
                }));

                const { error: tasksError } = await supabase
                    .from('tasks')
                    .insert(newTasks);

                if (tasksError) throw tasksError;
            }

            navigate('/dashboard'); // Eventually navigate to the specific onboarding view
        } catch (error) {
            console.error('Error creating onboarding:', error);
            alert('Failed to create onboarding. See console.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 animated-content">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">New Onboarding</h1>
                <p className="text-gray-500 mt-2">Start the journey for a new team member.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Step 1: Select Template */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
                        Select Template
                    </h3>

                    {isLoadingTemplates ? (
                        <div className="flex items-center justify-center py-8 text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading templates...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => setValue('template_id', template.id)}
                                    className={`
                        cursor-pointer p-4 rounded-xl border transition-all text-left relative
                        ${selectedTemplateId === template.id
                                            ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}
                    `}
                                >
                                    <h4 className={`font-semibold ${selectedTemplateId === template.id ? 'text-blue-700' : 'text-gray-900'}`}>{template.name}</h4>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                                    {selectedTemplateId === template.id && (
                                        <div className="absolute top-4 right-4 text-blue-600">
                                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {errors.template_id && <p className="text-red-500 text-sm mt-2">{errors.template_id.message}</p>}
                </section>

                {/* Step 2: Recruit Details */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">2</span>
                        Recruit Details
                    </h3>

                    <Card>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-4 h-4" /></span>
                                        <input
                                            {...register('recruit_name')}
                                            type="text"
                                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    {errors.recruit_name && <p className="text-red-500 text-xs">{errors.recruit_name.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="w-4 h-4" /></span>
                                        <input
                                            {...register('recruit_email')}
                                            type="email"
                                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    {errors.recruit_email && <p className="text-red-500 text-xs">{errors.recruit_email.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Role / Position</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Briefcase className="w-4 h-4" /></span>
                                        <input
                                            {...register('role')}
                                            type="text"
                                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
                                            placeholder="e.g. Senior Product Designer"
                                        />
                                    </div>
                                    {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Calendar className="w-4 h-4" /></span>
                                        <input
                                            {...register('start_date')}
                                            type="date"
                                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                    {errors.start_date && <p className="text-red-500 text-xs">{errors.start_date.message}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
                        ) : (
                            <>Launch Onboarding <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
