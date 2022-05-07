import dataclasses
import os
import argparse


@dataclasses.dataclass
class Config:
    out_file: str
    step_limit: int
    size_limit: int
    target_modules: list[str]
    dirs: list[str]
    module_mode: bool
    main: str
    args: list[str]

    def __init__(self):
        default_output = 'vtlog.db'

        parser = argparse.ArgumentParser(
            description='trace variables in execution')
        parser.add_argument("-o", "--output", default=default_output,
                            help="trace result output file")
        parser.add_argument("-s", "--step_limit", default=30000,
                            help="maximum steps to abort")
        parser.add_argument("-S", "--size_limit", default=500,
                            help="maximum size to abort")
        parser.add_argument('-M', '--target-module', action='append',
                            default=[],
                            help='additonal modules whose class instances will be traced')
        parser.add_argument('-d', '--dir', action='append',
                            default=[],
                            type=os.path.abspath,
                            help='directory which contains target files')
        parser.add_argument('-m', '--module-mode', action='store_true',
                            help='run as module mode')
        parser.add_argument("main", help='trace target entry file or module')
        parser.add_argument("main_args", nargs=argparse.REMAINDER,
                            help='trace target command arguments')
        args = parser.parse_args()
        self.out_file = args.output
        self.step_limit = args.step_limit
        self.size_limit = args.size_limit
        self.target_modules = args.target_module
        self.module_mode = args.module_mode
        self.dirs = args.dir
        self.main = args.main
        self.args = args.main_args
