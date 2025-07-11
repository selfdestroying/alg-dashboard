"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiPost } from "@/actions/api";
import { IGroup } from "@/types/group";
import { toast } from "sonner";
import { useData } from "@/providers/data-provider";

export default function GroupForm() {
  const { courses, users } = useData();
  const formSchema = z.object({
    name: z.string().min(1, { message: "This field is required" }),
    course: z.string().min(1, { message: "This field is required" }),
    user: z.string().min(1, { message: "This field is required" }),
    date: z.date({
      error: "This field is required.",
    }),
    time: z.string(),
    backofficeUrl: z.url({
      protocol: /^https$/,
      hostname: /^backoffice.algoritmika\.org$/,
    }),
    type: z.number(),
    lessonsAmount: z
      .number({
        error: "This field must be a number",
      })
      .min(1, { message: "This field is required" })
      .gt(-1, { message: "Must be greater than -1" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      course: "",
      user: "",
      date: new Date(),
      time: "",
      backofficeUrl: "",
      type: 0,
      lessonsAmount: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const body = {
      name: values.name,
      courseId: +values.course,
      userId: +values.user,
      startDate: format(values.date, "yyyy-MM-dd"),
      lessonTime: values.time,
      backofficeUrl: values.backofficeUrl,
      type: values.type,
      lessonsAmount: values.lessonsAmount,
    };
    const ok = apiPost<IGroup>("groups", body, "dashboard/groups");
    toast.promise(ok, {
      loading: "Загрузка...",
      success: (data) => data.message,
      error: (data) => data.message,
    });
  }

  function onReset() {
    form.reset();
    form.clearErrors();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={onReset}
        className="space-y-8 @container"
        id="group-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Название</FormLabel>
                <FormControl>
                  <Input
                    key="text-input-0"
                    placeholder=""
                    type="text"
                    className=" "
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="course"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Курс</FormLabel>
                <Select
                  key="select-0"
                  {...field}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full ">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Учитель</FormLabel>

                <Select
                  key="select-1"
                  {...field}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full ">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id.toString()}
                      >
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <p className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive">
                  Дата начала
                </p>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="justify-start text-left font-normal w-full"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(field.value, "dd.MM.yyyy")
                        : "Выбрать дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Дата начала</FormLabel>

                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="backofficeUrl"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">
                  Ссылка на backoffice
                </FormLabel>

                <FormControl>
                  <Input
                    key="url-input-0"
                    placeholder=""
                    type="url"
                    className=" "
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <p className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive">
                  Тип группы
                </p>
                <FormControl>
                  <RadioGroup
                    defaultValue={field.value.toString()}
                    onValueChange={(e) => field.onChange(+e)}
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="0" />
                      </FormControl>
                      <FormLabel className="font-normal">Группа</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="1" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Индивидуальные занятия
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="2" />
                      </FormControl>
                      <FormLabel className="font-normal">Интенсив</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lessonsAmount"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">
                  Количество занятий
                </FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      try {
                        field.onChange(+e.target.value);
                      } catch {
                        field.onChange(0);
                      }
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
