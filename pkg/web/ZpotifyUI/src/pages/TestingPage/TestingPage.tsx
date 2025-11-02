import cls from '@/pages/TestingPage/TestingPage.module.css'
import Carousel from "@/components/carousel/Carousel.tsx";

export default function TestingPage() {
    return (
        <div>
            <Carousel>
                <div className={cls.Part}>789</div>
                <div className={cls.Part}>563</div>
                <div className={cls.Part}>123</div>
                <div className={cls.Part}>321</div>
            </Carousel>
        </div>
    );
}
