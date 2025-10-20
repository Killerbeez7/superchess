export const Spinner = ({ size = 16 }: { size?: number }) => {
    return (
        <span
            className={`animate-spin inline-block w-${size} h-${size} rounded-full border-2 border-blue-500 border-t-transparent`}
        />
    );
};
