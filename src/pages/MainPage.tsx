import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const MainPage = () => {
  return (
    <>
      <div className="flex flex-col w-full max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex-1">
          <Textarea
            placeholder="Type your message here..."
            className="min-h-[200px] w-full resize-none"
          />
        </div>
        <div className="flex justify-end">
          <Button>Submit</Button>
        </div>
      </div>
    </>
  );
};
