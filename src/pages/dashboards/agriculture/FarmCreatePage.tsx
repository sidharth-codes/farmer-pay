import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Input,
  Label,
  FormError,
} from '../../../components/ui';
import { farmService } from '../../../services';
import { FARM_SIZE_UNITS } from '../../../constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../constants';

const schema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  farmSize: z.string().optional(),
  farmSizeUnit: z.enum(FARM_SIZE_UNITS).default('acres'),
  isOrganic: z.boolean().default(false),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function FarmCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'India', farmSizeUnit: 'acres', isOrganic: false },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      farmService.create({
        name: values.name,
        address: values.address,
        district: values.district,
        state: values.state,
        country: values.country,
        latitude: values.latitude ? parseFloat(values.latitude) : undefined,
        longitude: values.longitude ? parseFloat(values.longitude) : undefined,
        farm_size: values.farmSize ? parseFloat(values.farmSize) : undefined,
        farm_size_unit: values.farmSizeUnit,
        is_organic: values.isOrganic,
        description: values.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.farms });
      navigate('..');
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div>
      <PageHeader
        title="Add Farm"
        description="Register a new farm to start tracking harvests and batches."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Farms', href: '/dashboard/farmer/farms' }, { label: 'Add' }]}
        actions={
          <Button variant="outline" onClick={() => navigate('..')}>
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Farm name</Label>
              <Input id="name" placeholder="Green Valley Farm" invalid={!!errors.name} {...register('name')} />
              <FormError>{errors.name?.message}</FormError>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Farm Road" invalid={!!errors.address} {...register('address')} />
              <FormError>{errors.address?.message}</FormError>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="district">District</Label>
                <Input id="district" placeholder="Kollam" {...register('district')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="Kerala" {...register('state')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="India" {...register('country')} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="latitude">Latitude (optional)</Label>
                <Input id="latitude" type="number" step="any" placeholder="8.8932" {...register('latitude')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="longitude">Longitude (optional)</Label>
                <Input id="longitude" type="number" step="any" placeholder="76.6141" {...register('longitude')} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="farmSize">Farm size (optional)</Label>
                <Input id="farmSize" type="number" step="any" placeholder="5.5" {...register('farmSize')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="farmSizeUnit">Size unit</Label>
                <select
                  id="farmSizeUnit"
                  {...register('farmSizeUnit')}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {FARM_SIZE_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOrganic"
                className="h-4 w-4 rounded border-input text-primary focus-visible:ring-ring"
                {...register('isOrganic')}
              />
              <Label htmlFor="isOrganic" className="cursor-pointer">This farm is certified organic</Label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Tell us about your farm…"
                className="flex w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('description')}
              />
            </div>

            <Button type="submit" loading={isSubmitting}>
              <Save size={16} />
              Save farm
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
