type CoverProps = {
    coverUrl: string | null
    title: string | null
}

export const Cover = ({ coverUrl, title }: CoverProps) => (
    <div className="mt-[-1px] h-[225px] w-[150px] flex-shrink-0 overflow-hidden rounded-xl bg-[#160726]">
        {coverUrl ? (
            <img
                src={coverUrl}
                alt={title ? `${title} - okładka` : 'Okładka gry'}
                className="h-full w-full object-cover object-top transition-transform duration-1000 group-hover:scale-120"
                loading="lazy"
            />
        ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl border-[3px] border-white/20 bg-[#1d0832] p-1 text-center text-xs font-semibold tracking-[0.08em] text-[#cbb4ff]/80 uppercase">
                {title ? (
                    <div>
                        Brak okładki: <div>{title}</div>
                    </div>
                ) : (
                    'Brak okładki'
                )}
            </div>
        )}
    </div>
)
