"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Globe, ExternalLink, Info, Headphones } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function SupportPage() {
  const otherPrograms = [
    {
      name: "نظام الأرشفة الالكترونية",
      image: "/electronic-archiving-system.png",
      link: "https://afnan-tech.com/archiving",
    },
    {
      name: "نظام المتاجر الالكتروني",
      image: "/ecommerce-system.png",
      link: "https://afnan-tech.com/ecommerce",
    },
    {
      name: "الأفنان سجل إدارة المدارس",
      image: "/school-management-system.png",
      link: "https://afnan-tech.com/school-management",
    },
    {
      name: "نظام إدارة المستشفيات",
      image: "/hospital-management-system-interface.png",
      link: "https://afnan-tech.com/hospital",
    },
  ]

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-right">
        <h1 className="text-3xl font-bold text-foreground">الدعم الفني</h1>
        <p className="text-muted-foreground mt-2">معلومات الدعم والتواصل مع فريق الأفنان التقني</p>
      </div>

      {/* القسم العلوي: نبذة عن البرنامج */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="text-right">
          <CardTitle className="flex items-center gap-2 justify-end">
            <Info className="h-5 w-5 text-primary" />
            نبذة عن البرنامج
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-right text-muted-foreground leading-relaxed">
            برنامج إدارة الديون من الأفنان لتكنولوجيا المعلومات حيث سيوفر لك الوقت والجهد في إدارة المعاملات التجارية
            الخاصة بتعاملاتك مع ديون التجار والموردين والعملاء، بواجهات بسيطة وسهلة الاستخدام. يتميز البرنامج بإمكانيات
            متقدمة لتتبع الديون والمدفوعات، وإنشاء التقارير المفصلة، وإدارة بيانات العملاء والموردين بكفاءة عالية. كما
            يوفر نظام أمان متطور لحماية بياناتك المالية الحساسة.
          </p>
        </CardContent>
      </Card>

      {/* القسم الأوسط: معلومات الدعم الفني والتواصل */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="text-right">
          <CardTitle className="flex items-center gap-2 justify-end">
            <Headphones className="h-5 w-5 text-primary" />
            معلومات التواصل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            {/* شعار الشركة */}
            <div className="w-24 h-24 relative">
              <Image
                src="/afnan-technology-logo.png"
                alt="شعار الأفنان لتكنولوجيا المعلومات"
                fill
                className="object-contain rounded-lg"
              />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">الأفنان لتكنولوجيا المعلومات</h3>
              <Badge variant="secondary" className="mt-2">
                فريق الدعم الفني
              </Badge>
            </div>

            {/* معلومات التواصل */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4 text-center">
                  <Phone className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-medium text-sm text-muted-foreground mb-2">رقم الهاتف</p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground" dir="ltr">
                      +964 770 123 4567
                    </p>
                    <p className="text-sm font-bold text-foreground" dir="ltr">
                      +964 750 987 6543
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardContent className="p-4 text-center">
                  <Mail className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <p className="font-medium text-sm text-muted-foreground mb-2">البريد الإلكتروني</p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground" dir="ltr">
                      support@afnan-tech.com
                    </p>
                    <p className="text-sm font-bold text-foreground" dir="ltr">
                      info@afnan-tech.com
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4 text-center">
                  <Globe className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-medium text-sm text-muted-foreground mb-2">الموقع الإلكتروني</p>
                  <p className="text-sm font-bold text-foreground" dir="ltr">
                    www.afnan-tech.com
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* زر صفحة المنتج */}
            <Button
              onClick={() => openLink("https://afnan-tech.com/debt-management")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ExternalLink className="w-4 h-4 ml-2" />
              صفحة المنتج
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* القسم السفلي: برامجنا الأخرى */}
      <div className="space-y-4">
        <div className="text-right">
          <h2 className="text-2xl font-bold text-foreground">برامجنا الأخرى</h2>
          <p className="text-muted-foreground mt-1">تعرف على منتجاتنا التقنية الأخرى</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherPrograms.map((program, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              onClick={() => openLink(program.link)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="relative w-full h-24 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={program.image || "/placeholder.svg"}
                      alt={program.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-center font-medium text-foreground text-sm leading-relaxed">{program.name}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
