import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle,
  BellOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import communityService from "@/services/communityService";

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { language } = useLanguage();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () =>
      communityService.notifications.getAll({ page }).then((res) => res.data),
    enabled: !!user,
  });

  const notifications = data?.results || [];
  const hasNext = data?.next;
  const hasPrev = data?.previous;

  const markRead = useMutation({
    mutationFn: (id) => communityService.notifications.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  if (isLoading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20">
          <p className="p-6 text-center">Loading notifications...</p>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto max-w-2xl p-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="flex gap-2 items-center">
                <Bell className="w-5 h-5 text-forest" />
                {language === "en" ? "Notifications" : "الإشعارات"}
              </CardTitle>
              <Badge variant="secondary">{notifications.length}</Badge>
            </CardHeader>

            <CardContent className="p-0">
              <div className="h-[500px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <BellOff className="mx-auto mb-2 opacity-30" />
                    {language === "en" ? "No notifications" : "لا توجد إشعارات"}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex justify-between p-4 border-b ${
                        !n.is_read ? "bg-orange/5" : ""
                      }`}
                    >
                      <div>
                        <p
                          className={`text-sm ${
                            !n.is_read ? "font-semibold" : ""
                          }`}
                        >
                          {n.message}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {!n.is_read && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => markRead.mutate(n.id)}
                        >
                          <CheckCircle className="w-4 h-4 text-forest" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!hasPrev}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {language === "en" ? "Previous" : "السابق"}
              </Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                {language === "en" ? `Page ${page}` : `صفحة ${page}`}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!hasNext}
              >
                {language === "en" ? "Next" : "التالي"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
