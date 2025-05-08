'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
import { MultiSelect } from "@/components/ui/mutliselect";
import {  
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useState } from 'react';
import { Combobox, ComboboxOptions } from '@/components/combobox';


const formSchema = z.object({
  sensorID: z
    .string()
    .min(4, {
      message: 'SensorID besteht aus 4 Hexadezimal-Ziffern',
    })
    .regex(/^[0-9a-fA-F]{4}$/, {
      message: 'SensorID muss aus validen Hexadezimal-Ziffern bestehen',
    }),
  sensorTyp: z.enum(['esp8266', 'esp32'], {
    errorMap: () => ({ message: 'Bitte Sensor-Typ auswählen' })
  }),
  sensorData: z.enum(["Temperatur", "Luftfeuchtigkeit", "Luftdruck", "Helligkeit"], {})
});

const sensorDataOptions = [
  "Temperatur",
  "Luftfeuchtigkeit",
  "Luftdruck",
  "Helligkeit",
]

const frameworks: ComboboxOptions[] = [
  {
    value: 'next.js',
    label: 'ESP8266',
  },
  {
    value: 'sveltekit',
    label: 'ESP32',
  },
];

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sensorID: '',
      sensorTyp: undefined,
      sensorData: undefined
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  };

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedFlameWork, setSelectedFlameWork] = useState<ComboboxOptions>();

  function handleSelect(option: ComboboxOptions) {
    console.log('handleSelect');
    console.log(option);
    setSelectedFlameWork(option);
  }

  function handleAppendGroup(label: ComboboxOptions['label']) {
    const newFlameWork = {
      value: label,
      label,
    };
    frameworks.push(newFlameWork);
    console.log('handleAppendGroup');
    console.log(newFlameWork);
    handleSelect(newFlameWork);
  }


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-2/3 px-4 space-y-6"
      >
        {/* Unique SensorID */}
        <FormField
          control={form.control}
          name="sensorID"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SensorID</FormLabel>
              <FormControl>
              <InputOTP maxLength={4} {...field}>
                  <InputOTPGroup >
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>Eindeutige ID des Sensors</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sensor Type (e.g. ESP8266) */}
        <FormField
          control={form.control}
          name="sensorTyp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sensor Typ</FormLabel>
                    <Combobox
        options={frameworks}
        placeholder="Select favorite framework"
        selected={selectedFlameWork?.value ?? ''}
        onChange={handleSelect}
        onCreate={handleAppendGroup}
      />
              <FormDescription>
                Wählen Sie den Sensortyp aus{' '}
                <Link href="/examples/forms" className="pl-1">
                  {' '}
                  {/* Added pl-1 for link padding */}
                  Dokumentation
                </Link>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control}
          name="sensorData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sensor-Daten</FormLabel>
              <MultiSelect
        options={sensorDataOptions}
        selected={selectedSkills}
        onChange={setSelectedSkills}
        placeholder="Welche Daten stellt der Sensor zur Verfügung?"
      />
              <FormDescription>
              Welche Daten stellt der Sensor zur Verfügung?{' '}
                {/* <Link href="/examples/forms" className="pl-1">
                  {' '}
                  Dokumentation
                </Link> 
                */}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}/>
  
        {/* Submit Button */}
        <Button className="w-20" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
