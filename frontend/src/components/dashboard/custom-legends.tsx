import { COMMON_DATAS } from "@/lib/constants";

export default function CustomLegends({ type }: { type: 'row' | 'col' }) {
    const styles = {
        row: 'flex gap-3 mt-3 md:-mt-0 justify-center md:justify-start w-full mb-2',
        col: 'flex flex-col gap-y-4'
    };

    return (
        <div className={styles[type]}>
            {COMMON_DATAS.map((data, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div
                        className="w-2 md:w-3 h-2 md:h-3 rounded-full"
                        style={{ backgroundColor: data.color }}
                    />
                    <p className="text-sm lg:text-base">
                        {data.label}
                    </p>
                </div>
            ))}
        </div>
    );
}
