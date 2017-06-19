from database import Database
import argparse

class Analyzer():
    ignores = ['id', 'time', 'browser_fingerprint', 'computer_fingerprint_1']
    db = Database('uniquemachine')
    cols = db.run_sql("SHOW COLUMNS FROM features")

    def __init__(self):
        pass

    def check_imgs_difference_by_str(self, str_1, str_2):
        """
        check the differences of two gpu rendering result strs
        vars: str_1, str_2
        return: the differences
        """
        imgs_1 = str_1.split(',')
        imgs_2 = str_2.split(',')
        length = len(imgs_1)
        if len(imgs_2) != length:
            return "different number of imgs"
        imgs_1 = sorted(imgs_1, key=lambda img: int(img.split('_')[0]))
        imgs_2 = sorted(imgs_2, key=lambda img: int(img.split('_')[0]))

        res = {}
        for i in range(length):
            img_1 = imgs_1[i].split('_')[2]
            img_2 = imgs_2[i].split('_')[2]
            if img_1 != img_2:
                res[i] = (img_1, img_2)
        return res

    def check_fonts_difference_by_str(self, str_1, str_2):
        """
        check the differences of two font lists
        vars: str_1, str_2
        return: the differences
        """
        fonts_1 = str_1.split('_')
        fonts_2 = str_2.split('_')
        f1 = []
        f2 = []
        for f in fonts_1:
            if f not in fonts_2:
                f1.append(f)

        for f in fonts_2:
            if f not in fonts_1:
                f2.append(f)

        return (f1, f2)

    def output_diff(self, keys, values):
        length = len(keys)
        for i in range(length):
            print '\t'+ str(keys[i]) + ': \t' + str(values[i])

            
    def check_difference_by_id(self, base_id, entry_id):
        """
        check the difference of two entries based on the ids
        vars: id1, id2
        return: the array of differences
        """
        base_entry = self.db.get_entry_by_id('features', base_id)
        compare_entry = self.db.get_entry_by_id('features', entry_id)
        length = len(base_entry)
        for i in range(length):
            if self.cols[i][0] in self.ignores:
                continue
            if base_entry[i] != compare_entry[i]:
                if self.cols[i][0] == 'gpuimgs':
                    diff = self.check_imgs_difference_by_str(base_entry[i], compare_entry[i])
                    print self.cols[i][0]
                    self.output_diff(diff.keys(), diff.values())
                elif self.cols[i][0] == 'flashFonts':
                    diff = self.check_fonts_difference_by_str(base_entry[i], compare_entry[i])
                    print self.cols[i][0]
                    self.output_diff([base_id, entry_id], diff)
                else:
                    print self.cols[i][0]
                    self.output_diff([base_id, entry_id], [base_entry[i], compare_entry[i]])
        

    def check_difference_by_group(self, firefox_version, base_group, compare_group):
        """
        check the difference of two groups
        """
        sql_str = "SELECT id FROM features WHERE agent like '%" + str(firefox_version) + "%' and label like '%" + base_group + "%'"
        base_id = self.db.run_sql(sql_str)[0][0]
        sql_str = "SELECT id FROM features WHERE agent like '%" + str(firefox_version) + "%' and label like '%" + compare_group + "%'"
        compare_id = self.db.run_sql(sql_str)[0][0]
        self.check_difference_by_id(base_id, compare_id)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-g", "--group", nargs = '*', action="store", help="Input the key word of two groups")
    parser.add_argument("-v", "--firefox_version", type=int, action="store")
    args = parser.parse_args()
    groups = args.group
    firefox_version = args.firefox_version
    analyzer = Analyzer()
    analyzer.check_difference_by_group(firefox_version, groups[0], groups[1])



if __name__ == "__main__":
    main()